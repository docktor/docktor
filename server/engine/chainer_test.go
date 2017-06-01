package engine

import (
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func init() {
	SetDefaultFailureMode(FailureContinues)
}

func StepUpOK(namespace string) Operate {
	return func(c *ChainerContext) (string, error) {
		steps := c.Data[namespace+".up"].([]string)
		steps = append(steps, "V")
		c.Data[namespace+".up"] = steps
		return fmt.Sprintf("Up Step is OK"), nil
	}
}
func StepUpKO(namespace string) Operate {
	return func(c *ChainerContext) (string, error) {
		steps := c.Data[namespace+".up"].([]string)
		steps = append(steps, "X")
		c.Data[namespace+".up"] = steps
		return "", fmt.Errorf("Error with up step")
	}
}
func StepDownOK(namespace string) Operate {
	return func(c *ChainerContext) (string, error) {
		steps := c.Data[namespace+".down"].([]string)
		steps = append([]string{"V"}, steps...) //Prepend
		c.Data[namespace+".down"] = steps
		return fmt.Sprintf("Down Step is OK"), nil
	}
}
func StepDownKO(namespace string) Operate {
	return func(c *ChainerContext) (string, error) {
		steps := c.Data[namespace+".down"].([]string)
		steps = append([]string{"X"}, steps...) //Prepend
		c.Data[namespace+".down"] = steps
		return "", fmt.Errorf("Error with down step")
	}
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
				err := chainer.Add(
					"test",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)
				So(err, ShouldBeNil)
				err = chainer.Add(
					"test2",
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)
				So(err, ShouldBeNil)

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
		Convey("Given empty chain engine with a workflow", func() {
			chainer := NewChainEngine()
			_ = chainer.Add(
				"test",
				Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
			)
			Convey("When I try to remove an empty workflow", func() {
				err := chainer.Remove("")
				Convey("Then I get an error telling the workflow is empty", func() {
					So(err, ShouldNotBeNil)
					So(err.Error(), ShouldContainSubstring, "is empty")
				})
			})
			Convey("When I try to remove a workflow that does not exists", func() {
				err := chainer.Remove("not_existing")
				Convey("Then the existing workflow is still here", func() {
					So(err, ShouldBeNil)
					So(chainer.workflows, ShouldHaveLength, 1)
				})
			})
			Convey("When I try to remove an existing workflow", func() {
				err := chainer.Remove("test")
				Convey("Then the chainer should not contain any workflow anymore", func() {
					So(err, ShouldBeNil)
					So(chainer.workflows, ShouldHaveLength, 0)
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
			up := Operation{
				Errors: make(chan error),
				Status: make(chan string),
			}
			down := Operation{
				Errors: make(chan error),
				Status: make(chan string),
			}

			done := make(chan bool)

			Convey("When I run a workflow that does not exist", func() {
				go chainer.Run("dontexist", context, up, down, done)

				var nbStepOK, nbStepKO int
				Convey("Then I get errors saying that workflow does not exist", func() {
					run := true
					for run {
						select {
						case <-done:
							run = false
						case _, more := <-up.Status:
							if more {
								nbStepOK++
							}
						case err, more := <-up.Errors:
							if more {
								So(err.Error(), ShouldContainSubstring, "does not exist")
								nbStepKO++
							}
						case _, more := <-down.Status:
							if more {
								nbStepOK++
							}
						case err, more := <-down.Errors:
							if more {
								So(err.Error(), ShouldContainSubstring, "does not exist")
								nbStepKO++
							}
						}
					}
					Convey("and a single step has been executed and is KO", func() {
						So(nbStepOK, ShouldEqual, 0)
						So(nbStepKO, ShouldEqual, 1)
					})
				})
			})

			Convey("But When I run an existing workflow, and try to add a new one while chain is executing", func() {
				go chainer.Run("test", context, up, down, done)

				var nbStepOK, nbStepDownAndErrors int
				Convey("Then I get errors saying that I can't add a workflow while running", func() {
					run := true
					for run {
						select {
						case <-done:
							run = false
						case _, more := <-up.Status:
							if more {
								nbStepOK++
								// Adding a step while the worklow is running should not be possible
								if nbStepOK == 1 {
									So(chainer.workflows["test"].running, ShouldBeTrue)
									err := chainer.Add(
										"test",
										Step{Up: StepUpOK(""), Down: StepDownOK("")},
									)
									So(err, ShouldNotBeNil)
									So(err.Error(), ShouldContainSubstring, "it's already running")
								}
							}
						case _, more := <-up.Errors:
							if more {
								nbStepDownAndErrors++
							}
						case _, more := <-down.Status:
							if more {
								nbStepDownAndErrors++
							}
						case _, more := <-down.Errors:
							if more {
								nbStepDownAndErrors++
							}
						}
					}
					Convey("but every steps of the running engine end as OK", func() {
						So(chainer.workflows["test"].running, ShouldBeFalse)
						So(nbStepOK, ShouldEqual, 4)
						So(nbStepDownAndErrors, ShouldEqual, 0)
						So(context.Data["test.up"], ShouldHaveLength, 4)                          // All up steps should be visited
						So(context.Data["test.up"], ShouldResemble, []string{"V", "V", "V", "V"}) // All up steps should be visited
						So(context.Data["test.down"], ShouldBeEmpty)                              // No up steps should have be visited
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
			up := Operation{
				Errors: make(chan error),
				Status: make(chan string),
			}
			down := Operation{
				Errors: make(chan error),
				Status: make(chan string),
			}

			done := make(chan bool)
			Convey("When I run the workflow, with latest step that fail", func() {
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

				go chainer.Run("test", context, up, down, done)

				var nbStepOK, nbStepKO, nbRollbackOK, nbRollbackKO int
				Convey("Then the worklow should rollback to its inital state", func() {
					run := true
					for run {
						select {
						case <-done:
							run = false
						case _, more := <-up.Status:
							if more {
								nbStepOK++
							}
						case _, more := <-up.Errors:
							if more {
								nbStepKO++
							}
						case _, more := <-down.Status:
							if more {
								nbRollbackOK++
							}
						case _, more := <-down.Errors:
							if more {
								nbRollbackKO++
							}
						}
					}

					Convey("with all up steps visited, the last one should be KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"V", "V", "V", "X"}) // All up steps should be visited
						So(nbStepOK, ShouldEqual, 3)
						So(nbStepKO, ShouldEqual, 1)
					})
					Convey("and all rollback steps visited and OK", func() {
						So(context.Data["test.down"], ShouldResemble, []string{"V", "V", "V"}) // rollback steps should have be visited
						So(nbRollbackOK, ShouldEqual, 3)
						So(nbRollbackKO, ShouldEqual, 0)
					})
				})
			})
			Convey("When I run the workflow, with 2nd step that fail", func() {
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

				go chainer.Run("test", context, up, down, done)

				var nbStepOK, nbStepKO, nbRollbackOK, nbRollbackKO int
				Convey("Then the worklow should rollback to its inital state", func() {
					run := true
					for run {
						select {
						case <-done:
							run = false
						case _, more := <-up.Status:
							if more {
								nbStepOK++
							}
						case _, more := <-up.Errors:
							if more {
								nbStepKO++
							}
						case _, more := <-down.Status:
							if more {
								nbRollbackOK++
							}
						case _, more := <-down.Errors:
							if more {
								nbRollbackKO++
							}
						}
					}

					Convey("with first two up steps visited, the second one should be KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"V", "X"}) // Only first two steps should be visited
						So(nbStepOK, ShouldEqual, 1)
						So(nbStepKO, ShouldEqual, 1)
					})
					Convey("and single rollback steps visited and OK", func() {
						So(nbRollbackOK, ShouldEqual, 1)
						So(nbRollbackKO, ShouldEqual, 0)
						So(context.Data["test.down"], ShouldResemble, []string{"V"}) // rollback steps should have be visited
					})
				})
			})

			Convey("When I run the workflow, with 3rd step that fails and a rollback fails too", func() {
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

				go chainer.Run("test", context, up, down, done)

				var nbStepOK, nbStepKO, nbRollbackOK, nbRollbackKO int
				Convey("Then the worklow should rollback to its inital state", func() {
					run := true
					for run {
						select {
						case <-done:
							run = false
						case _, more := <-up.Status:
							if more {
								nbStepOK++
							}
						case _, more := <-up.Errors:
							if more {
								nbStepKO++
							}
						case _, more := <-down.Status:
							if more {
								nbRollbackOK++
							}
						case _, more := <-down.Errors:
							if more {
								nbRollbackKO++
							}
						}
					}

					Convey("with first 3 up steps visited, the 3d one should be KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"V", "V", "X"}) // Only first two steps should be visited
						So(nbStepOK, ShouldEqual, 2)
						So(nbStepKO, ShouldEqual, 1)
					})
					Convey("and rollback visited, even if an error occured", func() {
						So(nbRollbackOK, ShouldEqual, 1)
						So(nbRollbackKO, ShouldEqual, 1)
						So(context.Data["test.down"], ShouldResemble, []string{"V", "X"}) // rollback steps should have be visited
					})
				})
			})

			Convey("When I run the workflow, with 1st step that fails", func() {
				context := &ChainerContext{
					Data: map[string]interface{}{
						"test.up":   []string{},
						"test.down": []string{},
					},
				}
				chainer.Add(
					"test",
					Step{Up: StepUpKO("test"), Down: StepDownOK("test")},
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")}, // The rollback fails
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")}, // The first up step is KO
					Step{Up: StepUpOK("test"), Down: StepDownOK("test")},
				)

				go chainer.Run("test", context, up, down, done)

				var nbStepOK, nbStepKO, nbRollbackOK, nbRollbackKO int
				Convey("Then the worklow should rollback to its inital state", func() {
					run := true
					for run {
						select {
						case <-done:
							run = false
						case _, more := <-up.Status:
							if more {
								nbStepOK++
							}
						case _, more := <-up.Errors:
							if more {
								nbStepKO++
							}
						case _, more := <-down.Status:
							if more {
								nbRollbackOK++
							}
						case _, more := <-down.Errors:
							if more {
								nbRollbackKO++
							}
						}
					}

					Convey("with only first step visited and KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"X"}) // Only first two steps should be visited
						So(nbStepOK, ShouldEqual, 0)
						So(nbStepKO, ShouldEqual, 1)
					})
					Convey("and no rollback visited because nothing to rollback (as the first step failed)", func() {
						So(nbRollbackOK, ShouldEqual, 0)
						So(nbRollbackKO, ShouldEqual, 0)
						So(context.Data["test.down"], ShouldResemble, []string{}) // rollback steps should have be visited
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
			up := Operation{
				Errors: make(chan error),
				Status: make(chan string),
			}
			down := Operation{
				Errors: make(chan error),
				Status: make(chan string),
			}

			done := make(chan bool)

			Convey("When I run the workflow", func() {
				go chainer.Run("test", context, up, down, done)

				var nbStepOK, nbStepKO, nbRollbackOK, nbRollbackKO int
				Convey("Then the worklow should rollback to its inital state", func() {
					run := true
					for run {
						select {
						case <-done:
							run = false
						case _, more := <-up.Status:
							if more {
								nbStepOK++
							}
						case _, more := <-up.Errors:
							if more {
								nbStepKO++
							}
						case _, more := <-down.Status:
							if more {
								nbRollbackOK++
							}
						case _, more := <-down.Errors:
							if more {
								nbRollbackKO++
							}
						}
					}

					Convey("with only all up steps visited, the last one KO", func() {
						So(context.Data["test.up"], ShouldResemble, []string{"V", "V", "V", "X"}) // Only first two steps should be visited
						So(nbStepOK, ShouldEqual, 3)
						So(nbStepKO, ShouldEqual, 1)
					})
					Convey("and all rollbacks are visited and are OK", func() {
						So(nbRollbackOK, ShouldEqual, 2)
						So(nbRollbackKO, ShouldEqual, 0)
						So(context.Data["test.down"], ShouldResemble, []string{"V", "V"}) // rollback steps should have be visited
					})
				})
			})
		})
	})
}
