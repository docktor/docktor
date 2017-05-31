package types_test

import (
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"github.com/soprasteria/docktor/model/types"
)

func ExampleVolume_Format() {
	vc := types.Volume{
		External: "/brace/yourselves",
		Internal: "/winter/is/coming",
		Rights:   "ro",
	}
	fmt.Println(vc.Format())

	vc = types.Volume{
		External: "/brace/yourselves",
		Internal: "/winter/is/coming",
	}
	fmt.Println(vc.Format())

	//Output:
	// /brace/yourselves:/winter/is/coming:ro
	// /brace/yourselves:/winter/is/coming:rw
}
func TestGroups(t *testing.T) {
	Convey("On Groups types", t, func() {
		Convey("Given a list of members", func() {
			givenMembers := types.Members{
				{User: "batman", Role: types.MemberModeratorRole},
				{User: "batman", Role: types.MemberUserRole},
				{User: "batman", Role: types.MemberModeratorRole},
				{User: "superman", Role: types.MemberUserRole},
				{User: "superman", Role: types.MemberUserRole},
				{User: "robin", Role: types.MemberModeratorRole},
			}
			Convey("When I remove duplicates", func() {
				actualMembers := types.RemoveDuplicatesMember(givenMembers)
				Convey("Then duplicates should haven been deleted", func() {
					expectedMembers := types.Members{
						{User: "batman", Role: types.MemberModeratorRole},
						{User: "superman", Role: types.MemberUserRole},
						{User: "robin", Role: types.MemberModeratorRole},
					}
					So(actualMembers, ShouldResemble, expectedMembers)
				})
			})
		})
	})
}
