package types

import "fmt"

func ExampleVolumeEquals() {
	a := Volume{Internal: "/tmp", Value: "/external/tmp", Rights: "rw"}
	b := Volume{Internal: "/tmp", Value: "/external/tmp2", Rights: "rw"}
	c := Volume{Internal: "/internal/tmp", Value: "/external/tmp2", Rights: "rw"}
	d := Volume{Internal: "/tmp", Value: "/external/tmp", Rights: "ro"}
	fmt.Println(a.Equals(b))
	fmt.Println(a.Equals(c))
	fmt.Println(a.Equals(d))
	// Output:
	// true
	// false
	// false
}

func ExampleVolumesEquals() {
	a := Volume{Internal: "/tmp", Value: "/external/tmp", Rights: "rw"}
	b := Volume{Internal: "/tmp", Value: "/external/tmp2", Rights: "rw"}
	c := Volume{Internal: "/internal/tmp", Value: "/external/tmp2", Rights: "rw"}

	v1 := Volumes{a, b}
	v2 := Volumes{a, b}
	fmt.Println(v1.Equals(v2)) // identical

	v1 = Volumes{a, b}
	v2 = Volumes{a, c}
	fmt.Println(v1.Equals(v2)) // b and c are differents

	v1 = Volumes{a, a}
	v2 = Volumes{b, b}
	fmt.Println(v1.Equals(v2)) // a and b are identical

	v1 = Volumes{b, b}
	fmt.Println(v1.Equals(nil)) // v2 is nil

	v1 = Volumes{a, a}
	v2 = Volumes{b, b, b}
	fmt.Println(v1.Equals(v2)) // not same length

	v1 = Volumes{a, a, a}
	v2 = Volumes{b, b}
	fmt.Println(v1.Equals(v2)) // not same length

	v1 = Volumes{a, c}
	v2 = Volumes{c, a}
	fmt.Println(v1.Equals(v2)) // not same order but equals

	// Output:
	// true
	// false
	// true
	// false
	// false
	// false
	// true
}
