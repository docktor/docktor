package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
)

// Version and build information
// -ldflags "-X cmd.Verion=0.0.1 cmd.BuildDate=23-12-2016 cmd.GitHash='xxxxxx'
// Is populated with gulp file
var (
	Version   = "No version provided at build time"
	BuildDate = "No build date provided at build time"
	GitHash   = "No git hash provided at build time"
)

func printVersion() {
	fmt.Printf("App Version: %s\n", Version)
	fmt.Printf("Build UTC date: %s\n", BuildDate)
	fmt.Printf("Git Hash: %s\n", GitHash)
}

// serveCmd represents the serve command
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Get version of Docktor",
	Run: func(cmd *cobra.Command, args []string) {
		printVersion()
	},
}

func init() {
	RootCmd.AddCommand(versionCmd)
}
