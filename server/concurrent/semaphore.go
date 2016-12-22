package concurrent

type empty struct{}

// Semaphore is a very general synchronization mechanism that can be used to implement mutexes, limit access to multiple resources, solve the readers-writers problem, etc.
// see http://www.golangpatterns.info/concurrency/semaphores
type Semaphore chan empty

// P acquire n resources
func (s Semaphore) P(n int) {
	e := empty{}
	for i := 0; i < n; i++ {
		s <- e
	}
}

// V release n resources
func (s Semaphore) V(n int) {
	for i := 0; i < n; i++ {
		<-s
	}
}

// Lock acquire one resource
func (s Semaphore) Lock() {
	s.P(1)
}

// Unlock release one resource
func (s Semaphore) Unlock() {
	s.V(1)
}

// Signal release on resource
func (s Semaphore) Signal() {
	s.V(1)
}

// Wait is waiting for n ressources to be releases
func (s Semaphore) Wait(n int) {
	s.P(n)
}
