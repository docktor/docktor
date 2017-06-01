package engine

import (
	"errors"
	"fmt"
	"reflect"
	"runtime"
	"strings"

	"github.com/fatih/color"
)

const (
	processok = "PROCESS:OK"
	processko = "PROCESS:KO"
	rewindok  = "REWIND :OK"
	rewindko  = "REWIND :KO"
)

// ChainEngine allows to chain "up" steps
// When one error occurs, the chain is stopped and down steps are run in the inverse
// See examples in the unit tests
// Engine defines a set of workflows.
// Theses entries contains processes considered as steps of a workflow
type ChainEngine struct {
	workflows map[string]chainStep
}

// Operate is a function run in upstream or downstream process, such as a forward or a rollback action
type Operate func(*ChainerContext) (string, error)

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
	Data map[string]interface{}
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
				message, err := s.Up(c)
				if err != nil {
					upOp.Errors <- stepErrorf(s.Up, processko, "%v", err)
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
					message, err := s.Down(c)
					if err != nil {
						downOp.Errors <- stepErrorf(s.Down, rewindko, "%v", err)
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
	}
	return basename
}
