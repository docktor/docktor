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
	"github.com/soprasteria/docktor/server"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// VERSION of Docktor
const VERSION = "0.1"

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Launch Docktor server",
	Long:  `Docktor server will listen on 0.0.0.0:8080`,
	Run: func(cmd *cobra.Command, args []string) {
		server.New(VERSION)
	},
}

func init() {

	serveCmd.Flags().StringP("mongo_url", "m", "localhost:27017", "URL to access MongoDB")
	serveCmd.Flags().StringP("env", "e", "prod", "dev or prod")
	viper.BindPFlag("server.mongo", serveCmd.Flags().Lookup("mongo_url"))
	viper.BindPFlag("env", serveCmd.Flags().Lookup("env"))
	RootCmd.AddCommand(serveCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// serveCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// serveCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
