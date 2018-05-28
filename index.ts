#!/usr/bin/env node 

import { Command } from "commander";

export function hellowWorld(): string {

	return "Hellow world";
}

/*
class Startup {
    public static main(): number {
		
		var program = new Command("args")
		.version( "1.0.0" )
		.option( "-t --target [target]", "Specify the target file to write the build number to.");

		if( program.target ){};
		

		


        return 0;
    }
}

Startup.main();
*/