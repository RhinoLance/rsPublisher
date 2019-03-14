# rsPublisher
npm module used to help manage versioning and publishing of projects.

## To add new commands: ##
* Add new /bin/\<commandName\>.ts
* Add a reference in package.json "bin" list.
* Ensure the transpiled .js version exists in the /dist folder.
* run "npm link" to make the command available.

## Installation ##
	npm i --save-dev https://github.com/RhinoLance/rsPublisher.git 

## Usage ##
When using a command in a project, add a script to call the required command.

eg:

	"scripts": {
	  bumpBuild": "bumpBuild ./package.json"
	}
