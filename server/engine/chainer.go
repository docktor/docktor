package engine

import (
	"bytes"
	"context"
	"errors"
	"fmt"
)

// StepStatus is the status of step
// Can be OK, KO, In progress...
type StepStatus string

// StepStatusOK is the terminal status of a succeeded step
const StepStatusOK StepStatus = "OK"

// StepStatusKO is the terminal status of a failed step
const StepStatusKO StepStatus = "OK"

// StepStatusInProgress is the status of a step currently in progress, i.e. not terminated
const StepStatusInProgress StepStatus = "In progress..."

// StepStatusCanceled is the terminal status of a failed step, canceled by user or timeout
const StepStatusCanceled StepStatus = "Canceled"

// StepType is the type of a step
// Can be either Process or Rewind
type StepType string

// StepTypeProcess is the up/forward/process type of step
const StepTypeProcess StepType = "Process"

// StepTypeRewind is the down/rollback/rewind type of step
const StepTypeRewind StepType = "Rewind"

// StepNotif is an async notification to send while a step is executing
// Notifications can be a message explaining the step is starting, or a message explaining the step is OK or KO
type StepNotif struct {
	StepNumber int       // The index in the chain. Start from 1.
	TotalSteps int       // The total number of steps in the chain
	Operate    Operation // the step operate, meaning the function to perform in a step
	Message    string    // Message explaining the result of the step
	Error      error     // When not nil, it means that step is returned in error
	Type       StepType
	Status     StepStatus
}

// StepNotifier is a channel where we can push notifications
type StepNotifier chan StepNotif

// ChainEngine allows to chain "up" steps
// When one error occurs, the chain is stopped and down steps are run in the inverse
// See examples in the unit tests
// Engine defines a set of workflows.
// Theses entries contains processes considered as steps of a workflow
type ChainEngine struct {
	workflows map[string]chainStep
}

// ErrOperationCanceled is an error when an operation has been canceled
// Cancel occurs because of a manual operation by user, or by a reached timeout
type ErrOperationCanceled struct {
	reason string // Cancelling, Timeout and so on
}

func (err *ErrOperationCanceled) Error() string {
	if err.reason == "" {
		err.reason = "Unknown"
	}
	return fmt.Sprintf("Operation has been canceled, reason: %q", err.reason)
}

func isCanceled(err error) bool {
	switch err.(type) {
	case *ErrOperationCanceled:
		return true
	}
	return false
}

// Operation is a function run in upstream or downstream process, such as a forward or a rollback action
// cancelContext is a golang context used to handle a cancel during the operation
// ctx is the chaine context, containing the data needed to perform the operation
type Operation func(cancelContext context.Context, ctx *ChainerContext) (string, error)

// Step defines a step in a list of chained processes
// It has to define a up and a down function. The classical use is a chain of traitement that can rollback
// Each up function of step is the "commit" behaviour, when each down function is the reverse, aka the "rollback"
// Example :
// _ Everything OK : A -> B -> C
// _ Last up step KO but down ones OK :
// A -> B ->
//          C(KO)
// A <- B <-
type Step struct {
	Up   Operation
	Down Operation
}
type chainStep struct {
	Steps   []Step
	running bool
}

// ChainerContext defines all Data that could be used or modified across the steps
type ChainerContext struct {
	Data     map[string]interface{} // Data shared between steps
	Canceler Cancelable             // A message to this channel will cancel the step
	Notifier StepNotifier
}

// a simple result composed of a message and an error, both optional
// It's used to send result to a channel
type channelResult struct {
	message string
	err     error
}

// NewChainEngine initializes an Engine
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
	// Return in error if existing workflow is already running
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
	cs, ok := m.workflows[p]
	if !ok {
		return nil
	}
	if cs.running {
		return fmt.Errorf("Can't remove workflow %v while it's running", p)
	}
	delete(m.workflows, p)
	return nil
}

// Run runs all the steps defined in a workflow
// Context is shared between the steps. The context can be modified along the way
// Message are pushed to notifier channel along the way
func (m *ChainEngine) Run(p string, c *ChainerContext, notifier StepNotifier) error {
	if notifier == nil {
		return errors.New("Notifier is nil")
	}
	defer close(notifier)

	ch := make(chan error, 1)
	chainNotifs := make(StepNotifier)
	go func() {
		ch <- m.doRun(p, c, chainNotifs)
	}()

	for notif := range chainNotifs {
		notifier <- notif
	}

	return <-ch
}

func (m *ChainEngine) doRun(p string, c *ChainerContext, notifier StepNotifier) error { // nolint: gocyclo
	if notifier == nil {
		return errors.New("Notifier is nil")
	}
	defer close(notifier)
	c.Notifier = notifier

	w, ok := m.workflows[p]
	if !ok {
		return fmt.Errorf("Workflow named %v does not exist", p)
	}

	// Tells the chainer engine, that the workflow is currently running
	w.running = true
	m.workflows[p] = w
	defer func() {
		w.running = false
		m.workflows[p] = w
	}()

	var iStep int
	var errorHappened bool

	var numberOfSteps = len(w.Steps)
	var firstNotifInError StepNotif
	//Up. Stops when an error occurs
	for i, s := range w.Steps {
		if s.Up == nil {
			continue
		}
		message, err := doOperate(s.Up, c)
		stepNumber := i + 1
		if err != nil {
			status := StepStatusKO
			if isCanceled(err) {
				status = StepStatusCanceled
			}
			notif := StepNotif{
				Operate:    s.Up,
				Type:       StepTypeProcess,
				Status:     status,
				Error:      err,
				StepNumber: stepNumber,
				TotalSteps: numberOfSteps,
			}
			notifier <- notif
			iStep = i
			errorHappened = true
			firstNotifInError = notif
			break
		}

		notifier <- StepNotif{
			Operate:    s.Up,
			Type:       StepTypeProcess,
			Status:     StepStatusOK,
			Message:    message,
			StepNumber: stepNumber,
			TotalSteps: numberOfSteps,
		}
	}
	//Down, Continues even when errors occurs, but store them.
	rollbackMessages := []StepNotif{}
	if errorHappened {
		for i := iStep - 1; i >= 0; i-- {
			s := w.Steps[i]
			if s.Down == nil {
				continue
			}
			message, err := doOperate(s.Down, c)
			stepNumber := i + 1
			var notif StepNotif
			if err != nil {
				status := StepStatusKO
				if isCanceled(err) {
					status = StepStatusCanceled
				}
				notif = StepNotif{
					StepNumber: stepNumber,
					TotalSteps: numberOfSteps,
					Operate:    s.Down,
					Error:      err,
					Status:     status,
					Type:       StepTypeRewind,
				}
				rollbackMessages = append(rollbackMessages, notif)
			} else {
				notif = StepNotif{
					StepNumber: stepNumber,
					TotalSteps: numberOfSteps,
					Operate:    s.Down,
					Message:    message,
					Status:     StepStatusOK,
					Type:       StepTypeRewind,
				}
			}
			notifier <- notif
		}
	}

	return handleResult(firstNotifInError, rollbackMessages)
}

func handleResult(firstNotifInError StepNotif, rollbackMessages []StepNotif) error {
	if firstNotifInError.Error != nil {

		var rollbackMsgs string
		if len(rollbackMessages) > 0 {
			var rollbackErrors bytes.Buffer
			for _, message := range rollbackMessages {
				rollbackErrors.WriteString(fmt.Sprintf("- Step %v (%v/%v) - %v\n",
					getBaseNameFunction(firstNotifInError.Operate),
					message.StepNumber,
					message.TotalSteps,
					message.Error.Error(),
				))
			}
			rollbackMsgs = rollbackErrors.String()
		}
		if isCanceled(firstNotifInError.Error) {
			var errorsInRollbackMessage string
			if rollbackMsgs != "" {
				errorsInRollbackMessage = fmt.Sprintf("Rollback errors:\n%v", rollbackMsgs)
			}
			return fmt.Errorf(
				"Transition has been canceled while executing step %v (%v/%v) - %v. %v",
				getBaseNameFunction(firstNotifInError.Operate),
				firstNotifInError.StepNumber,
				firstNotifInError.TotalSteps,
				firstNotifInError.Error.Error(),
				errorsInRollbackMessage, //Optional rollback messages
			)
		}

		if len(rollbackMessages) > 0 {
			return fmt.Errorf(
				"Transition failed at step %v (%v/%v), but rollback is KO though - %v. Rollback errors:\n%v",
				getBaseNameFunction(firstNotifInError.Operate),
				firstNotifInError.StepNumber,
				firstNotifInError.TotalSteps,
				firstNotifInError.Error.Error(),
				rollbackMsgs,
			)
		}
		return fmt.Errorf("Transition failed at step %v (%v/%v) but rollback is OK - %v",
			getBaseNameFunction(firstNotifInError.Operate),
			firstNotifInError.StepNumber,
			firstNotifInError.TotalSteps,
			firstNotifInError.Error.Error(),
		)
	}

	return nil
}

// doOperate execute the operate with the context of execution
// It creates an cancel policy that is triggered when the canceler channel receives a message
// Only the current step will be canceled when signal is received
func doOperate(op Operation, ctx *ChainerContext) (string, error) {

	if ctx.Canceler == nil {
		return op(nil, ctx)
	}

	c := make(chan channelResult, 1)
	ctxCancelStep, cancelStep := context.WithCancel(context.Background())
	defer cancelStep() // Release resources

	// Run the cancel operation
	// And wait for its termination or an cancel signal
	go func() {
		msg, err := execCancelableOperation(ctxCancelStep, op, ctx)
		c <- channelResult{message: msg, err: err}
	}()
	select {
	case reason := <-ctx.Canceler:
		cancelStep() // Send signal to Operate that the operation has te be cancelled
		<-c          // Wait for Operate to return.
		return "", &ErrOperationCanceled{reason: reason}
	case res := <-c:
		// When nothing is canceled, operate ended successfully. The result is returned as is.
		return res.message, res.err
	}
}

// execCancelableOperation is executing operation function, by handling cancel context automatically
// As a consequence, Operation implementation does not need to handle canceling, except if it has to do something particular with it
// Basically, Operation implementation just need to pass the cancel context through its third party calls and handle the eventual errors
func execCancelableOperation(cancelCtx context.Context, op Operation, ctx *ChainerContext) (string, error) {

	if cancelCtx == nil {
		return op(nil, ctx)
	}

	c := make(chan channelResult, 1)
	go func() {
		msg, err := op(cancelCtx, ctx)
		c <- channelResult{message: msg, err: err}
	}()

	select {
	case <-cancelCtx.Done():
		res := <-c // Wait for operate to return.
		if res.err != nil {
			return "", res.err
		}
		if cancelCtx.Err() != nil {
			return "", cancelCtx.Err()
		}
		return "", errors.New(res.message)
	case res := <-c:
		return res.message, res.err
	}
}
