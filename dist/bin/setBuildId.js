#!/usr/bin/env node 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var chalk_1 = require("chalk");
var xmlpoke = require("xmlpoke");
var targetFile = "123";
var program = new commander_1.Command("setBuildId <targetFile>")
    .version("1.0.0")
    .arguments('<targetFile>')
    .action(function (target) { return targetFile = target; })
    .option("-t --type [type]", "Specify the type of file to update [appSettings, npmPackage].  If not specified it will attempt to guess based on the file type.")
    .parse(process.argv);
function main(target) {
    var processor;
    switch (program.type) {
        case "appSettings":
            processor = appSettings;
            break;
        case "npmPackage":
            processor = appSettings;
            break;
        default:
            console.log("No file type set, attempting to identify automatically ...");
            processor = guessType(targetFile);
    }
    var build = getBuildNumber();
    processor(build);
    console.log("Build syuccesfully updated to " + build);
}
function getBuildNumber() {
    var now = new Date();
    return now.getFullYear()
        + ("0" + (now.getMonth() + 1)).slice(-2)
        + ("0" + now.getDate()).slice(-2)
        + ("0" + now.getHours()).slice(-2)
        + ("0" + now.getMinutes()).slice(-2);
}
function guessType(targetFilePath) {
    if (targetFilePath.match(/(!?web|app).config.xml$/)) {
        return appSettings;
    }
    if (targetFilePath.match(/.xml$/)) {
        return appSettings;
    }
    if (targetFilePath.match(/package\.json$/)) {
        return npmPackage;
    }
    throw ("The file type could not be inferred by the target file name.");
}
function appSettings(build) {
    console.log("Processing as appSettings for " + targetFile);
    var fileFound = false;
    xmlpoke(targetFile, function (xml) {
        fileFound = true;
        xml.withBasePath('configuration')
            .set("appSettings/add[@key='Build']/@value", build);
    });
    if (!fileFound) {
        throw ("The specified target file not be found at " + targetFile);
    }
}
function npmPackage(build) {
    console.log("Processing as npmPackage for " + targetFile);
    console.log(build);
}
function targetError() {
    console.error(chalk_1.default.redBright("The specified target file could not be found"));
    process.exit(1);
}
try {
    main(targetFile);
}
catch (error) {
    console.error(chalk_1.default.redBright("\nERROR: " + error + "\n"));
    process.exit(1);
}
