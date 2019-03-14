#!/usr/bin/env node 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const xmlpoke = require("xmlpoke");
const fs = require("fs");
let targetFile = "";
let sourceFile = "";
var program = new commander_1.Command("syncCordovaConfig <source> <target>")
    .version("1.0.0")
    .arguments('<package.json> <config.xml>')
    .action((source, target) => {
    sourceFile = source;
    targetFile = target;
})
    .parse(process.argv);
function main(sourceFile, targetFile) {
    var obj = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    setXml(obj.build, obj.version, targetFile)
        .then(() => console.log("Succesfully synced config.xml to " + obj.version + "-" + obj.build));
}
function setXml(build, version, targetFile) {
    let fileFound = false;
    const xPath = [
        "w:widget/@android-versionCode",
        "w:widget/@ios-CFBundleVersion"
    ];
    xmlpoke(targetFile, xml => {
        fileFound = true;
        xml.errorOnNoMatches();
        xml.addNamespace('w', 'http://www.w3.org/ns/widgets');
        xPath.forEach(element => {
            console.log("adding " + build + " to " + element);
            xml.ensure(element);
            xml.set(element, build);
        });
        console.log("adding " + version + " to " + "w:widget/@version");
        xml.setOrAdd("w:widget/@version", version);
    });
    if (!fileFound) {
        Promise.reject(false);
        console.log("The specified target file not be found at " + targetFile);
        throw ("The specified target file not be found at " + targetFile);
    }
    return Promise.resolve(true);
}
function targetError() {
    console.error(chalk_1.default.redBright("The specified target file could not be found"));
    process.exit(1);
}
try {
    main(sourceFile, targetFile);
}
catch (error) {
    console.error(chalk_1.default.redBright("\nERROR: " + error + "\n"));
    process.exit(1);
}
