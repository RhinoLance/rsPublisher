#!/usr/bin/env node 

import { Command } from "commander";
import chalk from "chalk";
import * as xmlpoke from "xmlpoke";
import fs = require('fs');

let targetFile: string = "";
let sourceFile: string = "";

type Processor = (build:string, targetFile: string) => Promise<boolean>;

var program = new Command("syncCordovaConfig <source> <target>")
		.version( "1.0.0" )
		.arguments('<package.json> <config.xml>')
		.action( (source, target) => {
			sourceFile = source
			targetFile = target 
		})
		.parse(process.argv);

function main( sourceFile: string, targetFile: string) {

	var obj = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
	setXml( obj.build, obj.version, targetFile)
	.then( () => console.log( "Succesfully synced config.xml to " + obj.version + "-" + obj.build) );
}

function setXml( build: string, version: string, targetFile: string ): Promise<boolean>{

	let fileFound: boolean = false;

	const xPath = [
		"w:widget/@android-versionCode",
		"w:widget/@ios-CFBundleVersion"
	];

	xmlpoke(targetFile, xml => {
		fileFound = true;
		
		xml.errorOnNoMatches();
		xml.addNamespace('w', 'http://www.w3.org/ns/widgets');

		xPath.forEach(element => {
			
			console.log( "adding " + build + " to " + element );

			xml.ensure( element );
			xml.set(element, build);
		});

		console.log( "adding " + version + " to " + "w:widget/@version" );
		xml.setOrAdd( "w:widget/@version", version);
		
	});
	
	if( !fileFound ) {
		Promise.reject(false);

		console.log( "The specified target file not be found at " + targetFile );
		throw( "The specified target file not be found at " + targetFile );
	}

	return Promise.resolve(true);

}

function targetError() {
	console.error( chalk.redBright( "The specified target file could not be found"));
	process.exit(1);
}

try{
	main( sourceFile, targetFile );
}
catch( error ){
	console.error( chalk.redBright( "\nERROR: " + error + "\n" ));
	process.exit(1);
}