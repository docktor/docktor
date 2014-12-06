[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/docktor/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/docktor/docktor.svg?branch=master)](https://travis-ci.org/docktor/docktor)
[![Dependencies Status](https://david-dm.org/docktor/docktor.svg)](https://david-dm.org/docktor/docktor)
[![devDependency Status](https://david-dm.org/docktor/docktor/dev-status.svg)](https://david-dm.org/docktor/docktor#info=devDependencies)

## Dev In Progress !

## Roadmap
See. [Roadmap](https://github.com/docktor/docktor/labels/roadmap)

Notes below are for developers only. Docktor is not ready for production now.

## Before You Begin 
Before you begin we recommend you read about the basic building blocks that assemble Docktor: 
* MongoDB - Go through [MongoDB Official Website](http://mongodb.org/) and proceed to their [Official Manual](http://docs.mongodb.org/manual/), which should help you understand NoSQL and MongoDB better.
* Express - The best way to understand express is through its [Official Website](http://expressjs.com/), particularly [The Express Guide](http://expressjs.com/guide.html); you can also go through this [StackOverflow Thread](http://stackoverflow.com/questions/8144214/learning-express-for-node-js) for more resources.
* AngularJS - Angular's [Official Website](http://angularjs.org/) is a great starting point. You can also use [Thinkster Popular Guide](http://www.thinkster.io/), and the [Egghead Videos](https://egghead.io/).
* Node.js - Start by going through [Node.js Official Website](http://nodejs.org/) and this [StackOverflow Thread](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js), which should get you going with the Node.js platform in no time.

## Prerequisites
Make sure you have installed all these prerequisites on your development machine.
* cAdvisor - Run cAdvisor on each daemon to enable monitoring. https://github.com/google/cadvisor#quick-start-running-cadvisor-in-a-docker-container
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
* Finally, when the install process is over, npm will initiate a bower install command to install all the front-end modules needed for the application

## Running Docktor
After the install process is over, you'll be able to run your application using Grunt, just run grunt default task:

```
$ grunt
```

Docktor should run on the 3000 port so in your browser just go to [http://localhost:3000](http://localhost:3000)

That's it! your application should be running by now.

## License
GNU GENERAL PUBLIC LICENSE 3

See License File.
