// Copyright © 2016 NAME HERE <EMAIL ADDRESS>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var cfgFile string

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "docktor",
	Short: "Administration & Monitoring Deployment with Docker",
	Long: `Docktor is a web application which aims to make the deployment of docke services easier
With it, you can manage several daemons, services and group.
Each service can be deployed on a daemon for a group.
	`,
}

const (
	configPath            = "$HOME"
	configFile            = ".docktor"
	prefixForEnvVariables = "docktor"
)

// Execute adds all child commands to the root command sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)
	RootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.docktor.yaml)")
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile != "" { // enable ability to specify config file via flag
		viper.SetConfigFile(cfgFile)
	}

	viper.SetEnvPrefix(prefixForEnvVariables)                        // Prefix for every env variables
	viper.SetConfigName(configFile)                                  // name of config file (without extension)
	viper.AddConfigPath(configPath)                                  // adding home directory as first search path
	viper.AutomaticEnv()                                             // read in environment variables that match
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_", "-", "_")) // Replace "." and "-" by "_" for env variable lookup

	// If a config file is found, read it in.
	err := viper.ReadInConfig()
	if err == nil {
		fmt.Println("Using config file:" + viper.ConfigFileUsed())
	} else {
		fmt.Println("Cant read config file:" + viper.ConfigFileUsed())
	}
}
