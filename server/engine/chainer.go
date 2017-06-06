package engine

import (
	"context"
	"errors"
	"fmt"
	"reflect"
	"runtime"
	"strings"

	"github.com/fatih/color"
)

const (
	processInProgress = "Process: In progress..."
	processok         = "Process: ===== OK ====="
	processko         = "Process: ===== KO ====="
	processaborted    = "Process: == Aborted ==="
	rewindInProgress  = "Rewind : In progress..."
	rewindok          = "Rewind : ===== OK ====="
	rewindko          = "Rewind : ===== KO ====="
	rewindaborted     = "Reweind: == Aborted ==="
)

// ChainEngine allows to chain "up" steps
// When one error occurs, the chain is stopped and down steps are run in the inverse
// See examples in the unit tests
// Engine defines a set of workflows.
// Theses entries contains processes considered as steps of a workflow
type ChainEngine struct {
	workflows map[string]chainStep
}

// ErrOperationAborted is an error when an operation has been aborted
// It can be an cancelled error, and timeout error and so on
type ErrOperationAborted struct {
	typ    string // Process, rewind
	reason string // Cancelling, Timeout and so on
}

func (err *ErrOperationAborted) Error() string {
	if err.reason != "" && err.typ != "" {
		return fmt.Sprintf("%v operation has been aborted because %v", err.typ, err.reason)
	}
	if err.reason != "" {
		return fmt.Sprintf("Operation has been aborted because %v", err.reason)
	}
	if err.typ != "" {
		return fmt.Sprintf("%v operation has been aborted", err.typ)
	}
	return "Operation has been aborted"
}

func isAborted(err error) bool {
	if err == nil {
		return false
	}
	switch err.(type) {
	case *ErrOperationAborted:
		return true
	}
	return false
}

// Operate is a function run in upstream or downstream process, such as a forward or a rollback action
type Operate func(abortContext context.Context, ctx *ChainerContext) (string, error)

// Step defines a step in a list of chained processes
// It has to define a up and a down function. The classical use is a a chain of traitement that can rollback
// Each up function of step is the "commit" behaviour, when each down function is the reverse, aka the "rollback"
// Example :
// _ Everything OK : A -> B -> C
// _ Last up step KO but down ones OK :
// A -> B ->
//          C(KO)
// A <- B <-
type Step struct {
	Up   Operate
	Down Operate
}
type chainStep struct {
	Steps   []Step
	running bool
}

// Operation is a type of operation
// It containers an error and a status channel to communicate information about the operation
type Operation struct {
	Errors chan error
	Status chan string
}

// ChainerContext defines all Data that could be used or modified across the steps
type ChainerContext struct {
	Data             map[string]interface{} // Data shared between steps
	AbortEngine      chan struct{}          // A message to this channel will abort the step
	DeployableEntity DeployableEntity       // the entity that contains data needed for actions (e.g. container)
	notifBus         NotificationBus        // A bus used to send notifications
}

// a simple result composed of a message and an error, both optional
// It's used to send result to a channel
type channelResult struct {
	message string
	err     error
}

// NewChainEngine initialises an Engine
func NewChainEngine() *ChainEngine {
	return &ChainEngine{
		workflows: make(map[string]chainStep),
	}
}

// Add adds steps to a named engine entry
func (m *ChainEngine) Add(p string, steps ...Step) error {
	if p == "" {
		return errors.New("Workflow's name is empty")
	}
	cs, ok := m.workflows[p]
	if ok && cs.running {
		return fmt.Errorf("Can't add workflow %v while it's already running", p)
	}
	m.workflows[p] = chainStep{
		Steps:   steps[:],
		running: false,
	}
	return nil
}

// Remove removes the named engine workflow
func (m *ChainEngine) Remove(p string) error {
	if p == "" {
		return errors.New("Workflow's name is empty")
	}
	cs, ok := m.workflows[p]
	if ok && cs.running {
		return fmt.Errorf("Can't remove workflow %v while it's running", p)
	}
	delete(m.workflows, p)
	return nil
}

// Run runs all the steps defined in a workflow
// Context is shared between the steps. The context can be modified along the way
// Run has to be called with a goroutine.
// Each operation (up and down) contains a
// - Error channel gives all the errors along the way until it closes
// - Status channel gives all the message status along the way
func (m *ChainEngine) Run(p string, c *ChainerContext, upOp Operation, downOp Operation, done chan bool) {
	w, ok := m.workflows[p]
	if ok {
		var (
			iStep         int
			errorHappened bool
		)
		w.running = true
		m.workflows[p] = w
		//Up. Stops when an error occurs
		for i, s := range w.Steps {
			if s.Up != nil {
				message, err := doOperate(s.Up, c)
				if err != nil {
					var status = processko
					if isAborted(err) {
						status = processaborted
					}
					upOp.Errors <- stepErrorf(s.Up, status, "%v", err)
					iStep = i
					errorHappened = true
					break
				} else {
					upOp.Status <- stepSPrintf(s.Up, processok, "%v", message)
				}
			}
		}
		//Down, Continues even when errors occurs, but store them.
		if errorHappened {
			for i := iStep - 1; i >= 0; i-- {
				s := w.Steps[i]
				if s.Down != nil {
					message, err := doOperate(s.Down, c)
					if err != nil {
						var status = processko
						if isAborted(err) {
							status = processaborted
						}
						downOp.Errors <- stepErrorf(s.Down, status, "%v", err)
					} else {
						downOp.Status <- stepSWarnf(s.Down, rewindok, "%v", message)
					}
				}
			}
		}
		w.running = false
		m.workflows[p] = w
	} else {
		upOp.Errors <- fmt.Errorf("Workflow named %v does not exist", p)
	}
	close(upOp.Errors)
	close(upOp.Status)
	close(downOp.Errors)
	close(downOp.Status)
	done <- true
}

// doOperate execute the operate with the context of execution
// It creates an abort cancel policy that is triggered when the AbortEngine channel receives a message
// Only the current step will be canceled when signal is received
func doOperate(op Operate, ctx *ChainerContext) (string, error) {

	if ctx.AbortEngine == nil {
		return op(nil, ctx)
	}

	c := make(chan channelResult, 1)
	ctxCancelStep, cancelStep := context.WithCancel(context.Background())
	defer cancelStep() // Release resources

	// Run the abortable operation
	// And wait for its termination or a abort signal
	go func() {
		msg, err := execAbortableOperate(ctxCancelStep, op, ctx)
		c <- channelResult{message: msg, err: err}
	}()
	select {
	case <-ctx.AbortEngine:
		cancelStep() // Send signal to Operate that the operation has te be cancelled
		res := <-c   // Wait for Operate to return.
		var reason = res.message
		if res.err != nil {
			reason = res.err.Error()
		}
		return "", &ErrOperationAborted{
			typ:    getBaseNameFunction(op),
			reason: reason,
		}
	case res := <-c:
		// When nothing is cancel, operate ended successfully without abortinghe result is returned as is.
		return res.message, res.err
	}
}

// execAbortableOperate is executing operate function, by handling abort context automatically
// As a consequence, Operate implementation does not need to handle aborting, except if it has to do something particular with it
// Basically, Operate implementation just need to pass the abort context through its third party calls and handle the eventual errors
func execAbortableOperate(abortCtx context.Context, op Operate, ctx *ChainerContext) (string, error) {

	if abortCtx == nil {
		return op(nil, ctx)
	}

	c := make(chan channelResult, 1)
	go func() {
		msg, err := op(abortCtx, ctx)
		c <- channelResult{message: msg, err: err}
	}()

	select {
	case <-abortCtx.Done():
		res := <-c // Wait for operate to return.
		if res.err != nil {
			return "", res.err
		}
		return "", errors.New(res.message)
	case res := <-c:
		return res.message, res.err
	}
}

func stepSInfof(s interface{}, status string, message string, interfaces ...interface{}) string {
	blue := color.New(color.FgBlue).SprintFunc()
	return fmt.Sprintf("[%v] %-45v > %v", blue(status), getBaseNameFunction(s), fmt.Sprintf(message, interfaces...))
}

// StepSWarnf prints a message prefixed by the step
func stepSWarnf(s interface{}, status string, message string, interfaces ...interface{}) string {
	yellow := color.New(color.FgYellow).SprintFunc()
	return fmt.Sprintf("[%v] %-45v > %v", yellow(status), getBaseNameFunction(s), fmt.Sprintf(message, interfaces...))
}

// StepSPrintf prints a message prefixed by the step
func stepSPrintf(s interface{}, status string, message string, interfaces ...interface{}) string {
	green := color.New(color.FgGreen).SprintFunc()
	return fmt.Sprintf("[%v] %-45v > %v", green(status), getBaseNameFunction(s), fmt.Sprintf(message, interfaces...))
}

// StepErrorf prints an error prefixed by the step
func stepErrorf(s interface{}, status string, message string, interfaces ...interface{}) error {
	red := color.New(color.FgRed).SprintFunc()
	return fmt.Errorf("[%v] %-45v > %v", red(status), getBaseNameFunction(s), fmt.Sprintf(message, interfaces...))
}

// getFunctionName gets the function name
func getFunctionName(i interface{}) string {
	return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
}

// getBaseNameFunction gets the function name, amputed from its path
func getBaseNameFunction(i interface{}) string {
	partOfFunction := strings.Split(getFunctionName(i), "/")
	var basename string
	if len(partOfFunction) > 0 {
		basename = partOfFunction[len(partOfFunction)-1]
		partOfFunction = strings.Split(basename, ")")
		if len(partOfFunction) > 0 {
			return partOfFunction[0]
		}
	}
	return ""
}
