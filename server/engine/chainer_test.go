package engine

import (
	"context"
	"fmt"
	"testing"

	"github.com/labstack/gommon/log"
	. "github.com/smartystreets/goconvey/convey"
)

// Step Up is a generic method to generate an Operation, that will end in either OK (✔️), KO(✖️) or Canceled(🚫)
// The context is enriched with the given results, used for test assertion
// namespace is used for context
// typ is up or down
// inError is true if operation has to terminate in error
func StepTest(namespace string, typ string, inError bool) Operation {
	return func(abortCtx context.Context, ctx *ChainerContext) (string, error) {
		do := func() channelResult {
			steps := ctx.Data[namespace+"."+typ].([]string)
			var res channelResult

			if inError {
				res = channelResult{err: fmt.Errorf("Error with %v step", typ)}
				if typ == "up" {
					steps = append(steps, "✖️")
				} else {
					steps = append([]string{"✖️"}, steps...) //Prepend
				}
			} else {
				res = channelResult{message: fmt.Sprintf("%v step is OK", typ)}
				if typ == "up" {
					steps = append(steps, "✔️")
				} else {
					steps = append([]string{"✔️"}, steps...) //Prepend
				}
			}
			ctx.Data[namespace+"."+typ] = steps
			return res
		}

		if abortCtx == nil {
			res := do()
			return res.message, res.err
		}

		c := make(chan channelResult, 1)
		go func() {
			c <- do()
		}()

		select {
		case <-abortCtx.Done():
			<-c // Wait for operate to return.
			steps := ctx.Data[namespace+"."+typ].([]string)
			if typ == "up" {
				steps = append(steps, "🚫")
			} else {
				steps = append([]string{"🚫"}, steps...) //Prepend
			}

			ctx.Data[namespace+"."+typ] = steps
			return "", fmt.Errorf("%v step cancelled", typ)
		case res := <-c:
			return res.message, res.err
		}

	}
}

func StepUpOK(namespace string) Operation {
	return StepTest(namespace, "up", false)
}
func StepUpKO(namespace string) Operation {
	return StepTest(namespace, "up", true)
}
func StepDownOK(namespace string) Operation {
	return StepTest(namespace, "down", false)
}
func StepDownKO(namespace string) Operation {
	return StepTest(namespace, "down", true)
}

// StepTestAbort is a generic method to generat an Operate waiting until a cancel signal arrives
// It then should abort the process and enriched context with Aborted data (🚫)
func StepTestAbort(namespace string, typ string) Operation {
	return func(abortCtx context.Context, ctx *ChainerContext) (string, error) {

		abortTo := ctx.Data[namespace+"."+typ+".abortTo"].(chan string)
		abortFrom := ctx.Data[namespace+"."+typ+".abortFrom"].(chan string)
		abortContinue := ctx.Data[namespace+"."+typ+".abortContinue"].(chan string)

		do := func() channelResult {
			abortTo <- "Test is ready for a cancel"
			<-abortFrom
			return channelResult{message: "Done"}
		}

		c := make(chan channelResult, 1)
		go func() {
			c <- do()
		}()

		select {
		case <-abortCtx.Done():
			abortContinue <- "Cancel has been received"
			steps := ctx.Data[namespace+"."+typ].([]string)
			if typ == "up" {
				steps = append(steps, "🚫")
			} else {
				steps = append([]string{"🚫"}, steps...) //Prepend
			}
			ctx.Data[namespace+"."+typ] = steps
			return "", fmt.Errorf("%v step cancelled", typ)
		case res := <-c:
			return res.message, nil
		}

	}
}
func StepUpAbort(namespace string) Operation {
	return StepTestAbort(namespace, "up")
}
func StepDownAbort(namespace string) Operation {
	return StepTestAbort(namespace, "down")
}

// fetchNotifications consumes messages from notifier channel, and returns a summary of the result
func fetchNotifications(notifier StepNotifier) (nbUpOK int, nbUpKO int, nbDownOK int, nbDownKO int, errors []StepNotif) {
	errors = []StepNotif{}
	for msg := range notifier {
		log.Infof("%+v", msg)
		if msg.Error != nil {
			errors = append(errors, msg)
			if msg.Type == StepTypeProcess {
				nbUpKO++
			} else {
				nbDownKO++
			}
		} else {
			if msg.Type == StepTypeProcess {
				nbUpOK++
			} else {
				nbDownOK++
			}
		}
	}
	return
}

func TestChainerEngineAddWorkflow(t *testing.T) {
	Convey("On a docktor chainer engine", t, func() {
		Convey("Given an empty chain engine", func() {
			chainer := NewChainEngine()
			Convey("When I add a workflow without name", func() {
				err := chainer.Add(
					"",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)
				Convey("Then I should get an error", func() {
					So(err, ShouldNotBeNil)
					So(err.Error(), ShouldContainSubstring, "is empty")
				})
			})
			Convey("When I add two workflows in engine", func() {
				_ = chainer.Add(
					"test",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)
				_ = chainer.Add(
					"test2",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)

				Convey("Then, I have a first chainer", func() {
					w, ok := chainer.workflows["test"]
					So(ok, ShouldBeTrue)
					Convey("which is not running", func() {
						So(w.running, ShouldBeFalse)
					})
					Convey("which contains only one step", func() {
						So(w.Steps, ShouldHaveLength, 1)
					})
				})

				Convey("Then, I have a second chainer", func() {
					w, ok := chainer.workflows["test2"]
					So(ok, ShouldBeTrue)
					Convey("which is not running", func() {
						So(w.running, ShouldBeFalse)
					})
					Convey("which contains only one step", func() {
						So(w.Steps, ShouldHaveLength, 1)
					})
				})

				Convey("Then, I only have theses two workflows and not other ones", func() {
					So(chainer.workflows, ShouldHaveLength, 2)
					_, ok := chainer.workflows["unexisting-workflow"]
					So(ok, ShouldBeFalse)
				})
			})
		})
	})
}

func TestChainerEngineRemoveWorkflow(t *testing.T) {
	Convey("On a docktor chainer engine", t, func() {
		Convey("Given a chain engine with two workflows", func() {
			chainer := NewChainEngine()
			_ = chainer.Add(
				"test",
				Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
			)
			_ = chainer.Add(
				"test2",
				Step{Up: StepUpOK("test2"), Down: StepDownOK("test2")},
			)
			Convey("When I try to remove an empty workflow", func() {
				err := chainer.Remove("")
				Convey("Then the result is not in error, and the existing workflow is still here", func() {
					So(err, ShouldBeNil)
					So(chainer.workflows, ShouldHaveLength, 2)
				})
			})
			Convey("When I try to remove a workflow that does not exists", func() {
				err := chainer.Remove("not_existing")
				Convey("Then the two existing workflows are still here", func() {
					So(err, ShouldBeNil)
					So(chainer.workflows, ShouldHaveLength, 2)
				})
			})
			Convey("When I try to remove an existing workflow", func() {
				err := chainer.Remove("test")
				Convey("Then the chainer should contain only the workflow that has not been deleted", func() {
					So(err, ShouldBeNil)
					So(chainer.workflows, ShouldHaveLength, 1)
					So(chainer.workflows, ShouldNotContainKey, "test")
				})
			})
		})
	})
}

func TestChainerEngineSimpleOKWorkflow(t *testing.T) {
	Convey("On a docktor chainer engine", t, func() {
		Convey("Given a chainer engine with a simple workflow", func() {
			chainer := NewChainEngine()
			context := &ChainerContext{
				Data: map[string]interface{}{
					"test.up":   []string{},
					"test.down": []string{},
				},
			}
			chainer.Add(
				"test",
				Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
			)

			Convey("When I run a workflow that does not exist", func() {
				notifier := make(StepNotifier)
				go chainer.Run("dontexist", context, notifier)
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, _ := fetchNotifications(notifier)

				Convey("Then I get errors saying that workflow does not exist", func() {

					Convey("and a single step has been executed and is KO", func() {
						So(nbUpOK, ShouldEqual, 0)
						So(nbUpKO, ShouldEqual, 1)
						So(nbDownOK, ShouldEqual, 0)
						So(nbDownKO, ShouldEqual, 0)
					})
				})
			})

			Convey("But When I run an existing workflow, and try to add a new one while chain is executing", func() {
				notifier := make(StepNotifier)
				go chainer.Run("test", context, notifier)

				var nbStepOK, nbStepDownAndErrors int
				Convey("Then I get errors saying that I can't add a workflow while running", func() {

					for msg := range notifier {
						if msg.Error != nil {
							nbStepDownAndErrors++
						} else {
							if msg.Type == StepTypeProcess {
								nbStepOK++
								// Adding a workflow while it's running
								if nbStepOK == 1 {
									So(chainer.workflows["test"].running, ShouldBeTrue)
									err := chainer.Add(
										"test",
										Step{Up: StepUpOK(""), Down: StepDownOK("")},
									)
									So(err, ShouldNotBeNil)
									So(err.Error(), ShouldContainSubstring, "it's already running")
								}
							} else {
								nbStepDownAndErrors++
							}
						}
					}

					Convey("but every steps of the running engine end as OK", func() {
						So(chainer.workflows["test"].running, ShouldBeFalse)
						So(nbStepOK, ShouldEqual, 4)
						So(nbStepDownAndErrors, ShouldEqual, 0)
						So(context.Data["test.up"], ShouldHaveLength, 4)                              // All up steps should be visited
						So(context.Data["test.up"], ShouldResemble, []string{"✔️", "✔️", "✔️", "✔️"}) // All up steps should be visited
						So(context.Data["test.down"], ShouldBeEmpty)                                  // No up steps should have be visited
					})
				})
			})
		})
	})
}

func TestChainerEngineRollback(t *testing.T) {
	Convey("On a docktor chainer engine", t, func() {
		Convey("Given a chainer engine with a simple workflow of 4 steps", func() {
			chainer := NewChainEngine()

			Convey("When I run the workflow, with latest step that fail", func() {
				notifier := make(StepNotifier)
				context := &ChainerContext{
					Data: map[string]interface{}{
						"test.up":   []string{},
						"test.down": []string{},
					},
				}
				chainer.Add(
					"test",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpKO("test"), Down: StepDownOK("test")}, // The last step fails
				)

				go chainer.Run("test", context, notifier)
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors := fetchNotifications(notifier)

				Convey("Then the worklow should rollback to its inital state", func() {

					Convey("with all up steps visited, the last one should be KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"✔️", "✔️", "✔️", "✖️"}) // All up steps should be visited
						So(nbUpOK, ShouldEqual, 3)
						So(nbUpKO, ShouldEqual, 1)
						So(errors, ShouldHaveLength, 1)
						So(errors[0].StepNumber, ShouldEqual, 4)
						So(errors[0].Error.Error(), ShouldContainSubstring, "Error with up step")
					})
					Convey("and all rollback steps visited and OK", func() {
						So(context.Data["test.down"], ShouldResemble, []string{"✔️", "✔️", "✔️"}) // rollback steps should have be visited
						So(nbDownOK, ShouldEqual, 3)
						So(nbDownKO, ShouldEqual, 0)
					})
				})
			})
			Convey("When I run the workflow, with 2nd step that fail", func() {
				notifier := make(StepNotifier)
				context := &ChainerContext{
					Data: map[string]interface{}{
						"test.up":   []string{},
						"test.down": []string{},
					},
				}
				chainer.Add(
					"test",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpKO("test"), Down: StepDownOK("test")}, // The second step fails
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)

				go chainer.Run("test", context, notifier)
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors := fetchNotifications(notifier)
				Convey("Then the worklow should rollback to its inital state", func() {
					Convey("with first two up steps visited, the second one should be KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"✔️", "✖️"}) // Only first two steps should be visited
						So(nbUpOK, ShouldEqual, 1)
						So(nbUpKO, ShouldEqual, 1)
						So(errors, ShouldHaveLength, 1)
						So(errors[0].StepNumber, ShouldEqual, 2)
						So(errors[0].Error.Error(), ShouldContainSubstring, "Error with up step")
					})
					Convey("and single rollback steps visited and OK", func() {
						So(nbDownOK, ShouldEqual, 1)
						So(nbDownKO, ShouldEqual, 0)
						So(context.Data["test.down"], ShouldResemble, []string{"✔️"}) // rollback steps should have be visited
					})
				})
			})

			Convey("When I run the workflow, with 3rd step that fails and a rollback fails too", func() {
				notifier := make(StepNotifier)
				context := &ChainerContext{
					Data: map[string]interface{}{
						"test.up":   []string{},
						"test.down": []string{},
					},
				}
				chainer.Add(
					"test",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownKO("test")}, // The rollback fails
					Step{Up: StepUpKO("test"), Down: StepDownOK("test")}, // The first up step is KO
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)

				go chainer.Run("test", context, notifier)
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors := fetchNotifications(notifier)
				Convey("Then the worklow should rollback to its inital state", func() {
					Convey("with first 3 up steps visited, the 3d one should be KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"✔️", "✔️", "✖️"}) // Only first two steps should be visited
						So(nbUpOK, ShouldEqual, 2)
						So(nbUpKO, ShouldEqual, 1)
						So(errors, ShouldHaveLength, 2)
						So(errors[0].StepNumber, ShouldEqual, 3)
						So(errors[0].Error.Error(), ShouldContainSubstring, "Error with up step")
					})
					Convey("and rollback visited, even if an error occured", func() {
						So(nbDownOK, ShouldEqual, 1)
						So(nbDownKO, ShouldEqual, 1)
						So(context.Data["test.down"], ShouldResemble, []string{"✔️", "✖️"}) // rollback steps should have be visited
						So(errors[1].StepNumber, ShouldEqual, 2)
						So(errors[1].Error.Error(), ShouldContainSubstring, "Error with down step")
					})
				})
			})

			Convey("When I run the workflow, with 1st step that fails", func() {
				notifier := make(StepNotifier)
				context := &ChainerContext{
					Data: map[string]interface{}{
						"test.up":   []string{},
						"test.down": []string{},
					},
				}
				chainer.Add(
					"test",
					Step{Up: StepUpKO("test"), Down: StepDownOK("test")}, // The first step is KO
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)

				go chainer.Run("test", context, notifier)
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors := fetchNotifications(notifier)

				Convey("Then the worklow should rollback to its inital state", func() {
					Convey("with only first step visited and KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"✖️"}) // Only first step should be visited
						So(nbUpOK, ShouldEqual, 0)
						So(nbUpKO, ShouldEqual, 1)
						So(errors, ShouldHaveLength, 1)
						So(errors[0].StepNumber, ShouldEqual, 1)
						So(errors[0].Error.Error(), ShouldContainSubstring, "Error with up step")
					})
					Convey("and no rollback visited because nothing to rollback (as the first step failed)", func() {
						So(context.Data["test.down"], ShouldResemble, []string{}) // no rollback tests to visit
						So(nbDownOK, ShouldEqual, 0)
						So(nbDownKO, ShouldEqual, 0)
					})
				})
			})

		})
	})
}

func TestChainerEngineWithCancel(t *testing.T) {
	Convey("On a docktor chainer engine", t, func() {
		Convey("Given a chainer engine with a simple workflow of 4 steps", func() {
			chainer := NewChainEngine()

			Convey("When I run the workflow, and cancel it once while it's running", func() {
				notifier := make(StepNotifier)
				waitingForAbortTo := make(chan string)
				waitingForAbortFrom := make(chan string)
				waitingForAbortContinue := make(chan string)
				context := &ChainerContext{
					Data: map[string]interface{}{
						"test.up":               []string{},
						"test.down":             []string{},
						"test.up.abortTo":       waitingForAbortTo,
						"test.up.abortFrom":     waitingForAbortFrom,
						"test.up.abortContinue": waitingForAbortContinue,
					},
					Canceler: make(chan string),
				}
				go func() {
					<-waitingForAbortTo // Waiting for signal to abort process
					context.Canceler <- "Canceling !"
					<-waitingForAbortContinue
					waitingForAbortFrom <- "Continue!" // Send signal to abort process that it can continue
				}()
				chainer.Add(
					"test",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpAbort("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)

				go chainer.Run("test", context, notifier)
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors := fetchNotifications(notifier)

				Convey("Then the worklow should rollback to its inital state", func() {
					Convey("with the first 3 steps should be visited but the last one aborted", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"✔️", "✔️", "🚫"}) // The third step should receive an abort signal
						So(nbUpOK, ShouldEqual, 2)
						So(nbUpKO, ShouldEqual, 1)
						So(errors, ShouldHaveLength, 1)
						So(errors[0].StepNumber, ShouldEqual, 3)
						So(isCanceled(errors[0].Error), ShouldBeTrue)
					})
					Convey("with the rollback that should end as usual, with OK", func() {
						So(context.Data["test.down"], ShouldResemble, []string{"✔️", "✔️"}) // rollback steps should have be visited
						So(nbDownOK, ShouldEqual, 2)
						So(nbDownKO, ShouldEqual, 0)
					})
				})
			})

			Convey("When I run the workflow, and cancel it one time during up step and one time during rollback", func() {
				notifier := make(StepNotifier)
				waitingForUpAbortTo := make(chan string)
				waitingForUpAbortFrom := make(chan string)
				waitingForUpAbortContinue := make(chan string)
				waitingForDownAbortTo := make(chan string)
				waitingForDownAbortFrom := make(chan string)
				waitingForDownAbortContinue := make(chan string)
				context := &ChainerContext{
					Data: map[string]interface{}{
						"test.up":                 []string{},
						"test.down":               []string{},
						"test.up.abortTo":         waitingForUpAbortTo,
						"test.up.abortFrom":       waitingForUpAbortFrom,
						"test.up.abortContinue":   waitingForUpAbortContinue,
						"test.down.abortTo":       waitingForDownAbortTo,
						"test.down.abortFrom":     waitingForDownAbortFrom,
						"test.down.abortContinue": waitingForDownAbortContinue,
					},
					Canceler: make(chan string),
				}
				go func() {
					<-waitingForUpAbortTo // Waiting for signal to abort process
					context.Canceler <- "Canceling!"
					<-waitingForUpAbortContinue
					waitingForUpAbortFrom <- "Continue!" // Send signal to abort process that it can continue
				}()
				go func() {
					<-waitingForDownAbortTo // Waiting for signal to abort process
					context.Canceler <- "Canceling!"
					<-waitingForDownAbortContinue
					waitingForDownAbortFrom <- "Continue!" // Send signal to abort process that it can continue
				}()

				chainer.Add(
					"test",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownAbort("test")},
					Step{Up: StepUpAbort("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)

				go chainer.Run("test", context, notifier)
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors := fetchNotifications(notifier)

				Convey("Then the worklow should rollback to its inital state", func() {

					Convey("with the first 3 steps should be visited but the last one aborted", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"✔️", "✔️", "🚫"}) // The third step should receive an abort signal
						So(nbUpOK, ShouldEqual, 2)
						So(nbUpKO, ShouldEqual, 1)
						So(errors, ShouldHaveLength, 2)
						So(errors[0].StepNumber, ShouldEqual, 3)
						So(isCanceled(errors[0].Error), ShouldBeTrue)
					})
					Convey("with the rollback should end as usual, with the second one also aborted", func() {
						So(context.Data["test.down"], ShouldResemble, []string{"✔️", "🚫"}) // rollback steps should have be visited
						So(nbDownOK, ShouldEqual, 1)
						So(nbDownKO, ShouldEqual, 1)
						So(errors[1].StepNumber, ShouldEqual, 2)
						So(isCanceled(errors[0].Error), ShouldBeTrue)
					})
				})
			})
		})
	})
}

func TestChainerEngineWorkflowWithNoRollbacks(t *testing.T) {
	Convey("On a docktor chainer engine", t, func() {
		Convey("Given a chainer engine with a workflow, containing missing rollback at second step, and failing at the last step", func() {
			chainer := NewChainEngine()
			notifier := make(StepNotifier)
			context := &ChainerContext{
				Data: map[string]interface{}{
					"test.up":   []string{},
					"test.down": []string{},
				},
			}
			chainer.Add(
				"test",
				Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				Step{Up: StepUpOK("test")}, // Down does not exists
				Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				Step{Up: StepUpKO("test")},
			)

			Convey("When I run the workflow", func() {
				go chainer.Run("test", context, notifier)
				nbUpOK, nbUpKO, nbDownOK, nbDownKO, errors := fetchNotifications(notifier)

				Convey("Then the worklow should rollback to its inital state", func() {
					Convey("with only all up steps visited, the last one KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"✔️", "✔️", "✔️", "✖️"}) // Only first two steps should be visited
						So(nbUpOK, ShouldEqual, 3)
						So(nbUpKO, ShouldEqual, 1)
						So(errors, ShouldHaveLength, 1)
						So(errors[0].StepNumber, ShouldEqual, 4)
						So(errors[0].Error.Error(), ShouldContainSubstring, "Error with up step")
					})
					Convey("and all rollbacks are visited and are OK", func() {
						So(context.Data["test.down"], ShouldResemble, []string{"✔️", "✔️"}) // rollback steps should have be visited
						So(nbDownOK, ShouldEqual, 2)
						So(nbDownKO, ShouldEqual, 0)
					})
				})
			})
		})
	})
}
