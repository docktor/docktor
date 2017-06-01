package engine

import "testing"

func TestGetState_ok(t *testing.T) {
	state, err := getState("created") // existing state
	if err != nil {
		t.Fatal("State exists, it should not return any error")
	}
	if state.Name() != "created" {
		t.Fatal("State exist and should be equal to the existing one")
	}
}

func TestGetState_ko(t *testing.T) {
	_, err := getState("wrong-state")
	if err == nil {
		t.Fatal("Wrong state, it should return an error")
	}
}
