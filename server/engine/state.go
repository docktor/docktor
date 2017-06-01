package engine

import "fmt"

type State string

func (s State) Name() string {
	return string(s)
}

const (
	StateInitial State = "initial"
	StateCreated State = "created"
	StateStarted State = "started"
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
