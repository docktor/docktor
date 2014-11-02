## Dev In Progress !

[![Build Status](https://travis-ci.org/yesnault/docktor.svg?branch=master)](https://travis-ci.org/yesnault/docktor)
[![Dependencies Status](https://david-dm.org/yesnault/docktor.svg)](https://david-dm.org/yesnault/docktor)

Notes below are for developers only. Docktor is not ready for production now.

## Roadmap
* ~~Deploy a new service for a group : new container from a image~~ Done
* ~~Check all services (up, down) for a group~~ Done
* ~~Action on a container (pause, start, stop, kill, remove)~~ Done
* ~~Action on container (from daemon UI, without group)~~
* Action on image (from daemon UI, without group)
* Monitoring Containers --> With cAdvisor's API
* Monitoring Daemons
* Display a map of Daemons (GPS infos)
* Delete a service : check if there is no container (started or not) before delete it
* Update a image : same
* REST Api
* Add image : get internal port from Docker Image selected
* Admin users :  admin / user of group
* Improve UI

## Before You Begin 
Before you begin we recommend you read about the basic building blocks that assemble Docktor: 
* MongoDB - Go through [MongoDB Official Website](http://mongodb.org/) and proceed to their [Official Manual](http://docs.mongodb.org/manual/), which should help you understand NoSQL and MongoDB better.
* Express - The best way to understand express is through its [Official Website](http://expressjs.com/), particularly [The Express Guide](http://expressjs.com/guide.html); you can also go through this [StackOverflow Thread](http://stackoverflow.com/questions/8144214/learning-express-for-node-js) for more resources.
* AngularJS - Angular's [Official Website](http://angularjs.org/) is a great starting point. You can also use [Thinkster Popular Guide](http://www.thinkster.io/), and the [Egghead Videos](https://egghead.io/).
* Node.js - Start by going through [Node.js Official Website](http://nodejs.org/) and this [StackOverflow Thread](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js), which should get you going with the Node.js platform in no time.

## Prerequisites
Make sure you have installed all these prerequisites on your development machine.
* Node.js - [Download & Install Node.js](http://www.nodejs.org/download/) and the npm package manager, if you encounter any problems, you can also use this [Github Gist](https://gist.github.com/isaacs/579814) to install Node.js.
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages, in order to install it make sure you've installed Node.js and npm, then install bower globally using npm:

```
$ npm install -g bower
```

* Grunt - You're going to use the [Grunt Task Runner](http://gruntjs.com/) to automate your development process, in order to install it make sure you've installed Node.js and npm, then install grunt globally using npm:

```
$ sudo npm install -g grunt-cli
```

### Cloning The GitHub Repository
You can also use Git to directly clone the docktor repository:
```
$ git clone https://github.com/yesnault/docktor.git docktor
```
This will clone the latest version of the docktor repository to a **docktor** folder.


## Quick Install
Once you've installed all the prerequisites, you're just a few steps away from starting to develop docktor application.

The first thing you should do is install the Node.js dependencies. The boilerplate comes pre-bundled with a package.json file that contains the list of modules you need to start your application, to learn more about the modules installed visit the NPM & Package.json section.

To install Node.js dependencies you're going to use npm again, in the application folder run this in the command-line:

```
$ npm install
```

This command does a few things:
* First it will install the dependencies needed for the application to run.
* If you're running in a development environment, it will then also install development dependencies needed for testing and running your application.
* Finally, when the install process is over, npm will initiate a bower installcommand to install all the front-end modules needed for the application

## Running Docktor
After the install process is over, you'll be able to run your application using Grunt, just run grunt default task:

```
$ grunt
```

Docktor should run on the 3000 port so in your browser just go to [http://localhost:3000](http://localhost:3000)
                            
That's it! your application should be running by now, to proceed with your development check the other sections in this documentation. 

## Development and deployment With Docker

* Install [Docker](http://www.docker.com/)
* Install [Fig](https://github.com/orchardup/fig)

* Local development and testing with fig: 
```bash
$ fig up
```

* Local development and testing with just Docker:
```bash
$ docker build -t mean .
$ docker run -p 27017:27017 -d --name db mongo
$ docker run -p 3000:3000 --link db:db_1 mean
```

* To enable live reload forward 35729 port and mount /app and /public as volumes:
```bash
$ docker run -p 3000:3000 -p 35729:35729 -v /Users/mdl/workspace/mean-stack/mean/public:/home/mean/public -v /Users/mdl/workspa/mean-stack/mean/app:/home/mean/app --link db:db_1 mean
```

## Credits
Inspired by the great work of [Madhusudhan Srinivasa](https://github.com/madhums/)
The MEAN name was coined by [Valeri Karpov](http://blog.mongodb.org/post/49262866911/the-mean-stack-mongodb-expressjs-angularjs-and)

## License
GNU GENERAL PUBLIC LICENSE 3

See License File.
