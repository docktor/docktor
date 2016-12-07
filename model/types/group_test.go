package types

import "fmt"

func ExampleVolume_Format() {
	vc := Volume{
		External: "/brace/yourselves",
		Internal: "/winter/is/coming",
		Rights:   "ro",
	}
	fmt.Println(vc.Format())

	vc = Volume{
		External: "/brace/yourselves",
		Internal: "/winter/is/coming",
	}
	fmt.Println(vc.Format())

	//Output:
	// /brace/yourselves:/winter/is/coming:ro
	// /brace/yourselves:/winter/is/coming:rw
}
