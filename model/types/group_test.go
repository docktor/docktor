package types

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

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

func TestMembers_RemoveDuplicates(t *testing.T) {
	// Given
	givenMembers := Members{
		{User: "batman", Role: MemberModeratorRole},
		{User: "batman", Role: MemberUserRole},
		{User: "batman", Role: MemberModeratorRole},
		{User: "superman", Role: MemberUserRole},
		{User: "superman", Role: MemberUserRole},
		{User: "robin", Role: MemberModeratorRole},
	}

	// When removing duplicates
	actualMembers := removeDuplicatesMember(givenMembers)

	// Then duplicates should haven been deleted
	expectedMembers := Members{
		{User: "batman", Role: MemberModeratorRole},
		{User: "superman", Role: MemberUserRole},
		{User: "robin", Role: MemberModeratorRole},
	}
	assert.Equal(t, actualMembers, expectedMembers, "Duplicates should have been deleted")

}
