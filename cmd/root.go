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
	"io"
	"os"
	"strings"

	"gopkg.in/natefinch/lumberjack.v2"

	log "github.com/Sirupsen/logrus"
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
		log.Fatal(err)
	}
}

func init() {
	cobra.OnInitialize(initLogger, initConfig)
	RootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "Config file (default is $HOME/.docktor.yaml)")
	RootCmd.PersistentFlags().StringP("level", "l", "warning", "Choose the logger level: debug, info, warning, error, fatal, panic")
	RootCmd.PersistentFlags().Int("log-max-size", 500, "Max log file size in megabytes")
	RootCmd.PersistentFlags().Int("log-max-age", 30, "Max log file age in days")
	_ = viper.BindPFlag("level", RootCmd.PersistentFlags().Lookup("level"))
	_ = viper.BindPFlag("log-max-size", RootCmd.PersistentFlags().Lookup("log-max-size"))
	_ = viper.BindPFlag("log-max-age", RootCmd.PersistentFlags().Lookup("log-max-age"))
}

func initLogger() {
	output := io.MultiWriter(os.Stdout, &lumberjack.Logger{
		Filename:   "./logs/docktor.log",
		MaxSize:    viper.GetInt("log-max-size"),
		MaxBackups: 3,
		MaxAge:     viper.GetInt("log-max-age"),
	})
	log.SetOutput(output)

	level, err := log.ParseLevel(viper.GetString("level"))
	if err != nil {
		level = log.WarnLevel
		log.WithError(err).WithField("defaultLevel", level).Warn("Invalid log level, using default")
	}
	log.SetLevel(level)

	log.SetFormatter(&log.TextFormatter{})
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
		log.WithField("configFile", viper.ConfigFileUsed()).Info("Using provided config file")
	} else {
		log.WithError(err).Warn("Error with provided config file")
	}
}
