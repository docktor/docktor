package engine

import "fmt"

// State is a state of state machine, defining the status of a deployable entity in Docktor
// For example, a container can be in "started" State when it's up and running
type State string

// Name get the usual name of the state
func (s State) Name() string {
	return string(s)
}

const (
	// StateInitial is a virtual when entity is not created on Docktor (not even in the database)
	StateInitial State = "initial"
	// StateCreated is when the entity is created on Docktor but not on the machine
	StateCreated State = "created"
	// StateStarted is when the entity is deployed and started on the machine
	StateStarted State = "started"
	// StateStopped is when the entity is deployed but stopped on the machine
	StateStopped State = "stopped"
)

var allStates = map[string]State{
	StateInitial.Name(): StateInitial,
	StateCreated.Name(): StateCreated,
	StateStarted.Name(): StateStarted,
	StateStopped.Name(): StateStopped,
}

func getState(str string) (State, error) {
	state, ok := allStates[str]
	if !ok {
		return "", fmt.Errorf("State %v is unknown. Should be in %+v", str, allStates)
	}

	return state, nil

}
