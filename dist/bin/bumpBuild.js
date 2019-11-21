#!/usr/bin/env node 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const git = require("simple-git/promise");
const xmlpoke = require("xmlpoke");
const jsonfile = require("jsonfile");
let targetFile = "123";
var program = new commander_1.Command("bumpBuild <targetFile>")
    .version("1.0.0")
    .arguments('<targetFile>')
    .action(target => targetFile = target)
    .option("-t --type [type]", "Specify the type of file to update [appSettings, npmPackage].  If not specified it will attempt to guess based on the file type.")
    .option("-nt --no-tag", "Do not 'git tag' this version")
    .parse(process.argv);
function main(target) {
    let processor;
    switch (program.type) {
        case "appSettings":
            processor = appSettings;
            break;
        case "npmPackage":
            processor = npmPackage;
            break;
        case "cordova":
            processor = cordova;
            break;
        default:
            console.log("No file type set, attempting to identify automatically ...");
            processor = guessType(targetFile);
    }
    const build = getBuildNumber();
    processor(build, targetFile)
        .then(() => {
        if (program.tag) {
            console.log("Bump complete, starting tagging.");
            return tagAndPush(build, targetFile);
        }
        else {
            return Promise.resolve(true);
        }
    })
        .then(() => console.log("Build syuccesfully updated to " + build));
}
function tagAndPush(build, targetFile) {
    const tagName = "b" + build;
    const promise = new Promise((resolve, reject) => {
        git().add(targetFile)
            .then(() => git().commit("Bumped build to " + build))
            .then(() => git().tag([tagName]))
            .then(() => git().push("origin", tagName))
            .then(() => resolve(true));
    });
    return promise;
}
function getBuildNumber() {
    const now = new Date();
    return now.getFullYear()
        + ("0" + (now.getMonth() + 1)).slice(-2)
        + ("0" + now.getDate()).slice(-2)
        + ("0" + now.getHours()).slice(-2)
        + ("0" + now.getMinutes()).slice(-2);
}
function guessType(targetFilePath) {
    if (targetFilePath.match(/(!?[wW]eb|[aA]pp).config$/)) {
        return appSettings;
    }
    if (targetFilePath.match(/config.xml$/)) {
        return cordova;
    }
    if (targetFilePath.match(/.xml$/)) {
        return appSettings;
    }
    if (targetFilePath.match(/package\.json$/)) {
        return npmPackage;
    }
    throw ("The file type could not be inferred by the target file name.");
}
function bumpXml(build, xPath, targetFile, namespace) {
    let fileFound = false;
    xmlpoke(targetFile, xml => {
        fileFound = true;
        if (namespace) {
            xml.addNamespace("x", namespace);
        }
        xPath.forEach(element => {
            element = namespace ? `x:${namespace}` : element;
            xml.setOrAdd(element, build);
        });
    });
    if (!fileFound) {
        Promise.reject(false);
        throw ("The specified target file not be found at " + targetFile);
    }
    return Promise.resolve(true);
}
function appSettings(build, targetFile) {
    console.log("Processing as appSettings for " + targetFile);
    return bumpXml(build, ["configuration/appSettings/add[@key='Build']/@value"], targetFile);
}
function cordova(build, targetFile) {
    console.log("Processing as Cordova for " + targetFile);
    const xPathList = [
        "widget[@key='android-versionCode']/@value",
        "widget[@key='ios-CFBundleVersion']/@value"
    ];
    return bumpXml(build, xPathList, targetFile, "http://www.w3.org/ns/widgets");
}
function npmPackage(build, targetFile) {
    console.log("Processing as npmPackage for " + targetFile);
    const promise = new Promise((resolve, reject) => {
        jsonfile.readFile(targetFile, function (err, obj) {
            if (err) {
                throw ("Error reading the target file: " + JSON.stringify(err));
            }
            obj.build = build;
            jsonfile.writeFile(targetFile, obj, { spaces: 2 }, (err) => {
                if (err) {
                    reject(false);
                    throw ("Error bumping the build: " + JSON.stringify(err));
                }
                resolve(true);
            });
        });
    });
    return promise;
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
