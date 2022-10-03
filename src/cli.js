#!/usr/bin/env node
import yargs from "yargs";
import inquirer from "inquirer";
import * as utils from "./utils/index.js";
import shell from "shelljs";
import logSymbols from 'log-symbols';
import clc from "cli-color";

const argv = yargs(process.argv.slice(2))
    .usage("Usage: md-links <command> [options]")
    .example("md-links -f readme.md -v -s")
    .example("md-links --file {YOUR FILE PATH} --validate --stats")
    .alias("f", "file")
    .nargs("f", 1)
    .describe("f", "Path to file relative or absolute route")
    .alias("v", "validate")
    .describe("v", "Validate the url")
    .default("v", false)
    .alias("s", "stats")
    .describe("s", "Estadisticas de archivos conseguidos")
    .default("s", false)
    .boolean(["v", "s"])
    .demandOption(["f"])
    .help("h")
    .alias("h", "help").argv;

const questions = [
    {
        type: "checkbox",
        name: "files",
        message: "Select files (Press 'a' key for scan all files)",
        choices: (answers) => {
            return utils.traverseSync(argv.file);
        },
    },
    {
        type: "confirm",
        message: "Are you sure do you want to continue?",
        name: "confirm",
    },
];

inquirer
    .prompt(questions)
    .then((answers) => {
        if (answers.confirm && answers.files.length > 0) {
            answers.files.map((element) => {
                utils
                    .readFile(element)
                    .then(async (res) => {
                        const links = await utils.validateLinksFiles(res);


                        console.log("\n", "-----------------------------------------");
                        console.log("\n", "FILE: ", clc.blueBright.bold(element), "\n");

                        if (links.length > 0) {
                            let success = 0;
                            let error = 0;

                            links.forEach(element => {
                                if (element.success) {
                                    success++;
                                    console.log(logSymbols.success, element.url, "\n");
                                } else {
                                    error++;
                                    console.log(logSymbols.error, element.url, "\n");
                                }
                            });

                            console.log(clc.blue(links.length), "CHECKED");
                            console.log(clc.green(success), "Success");
                            console.log(clc.red(error), "Error", "\n");


                        } else {
                            console.log(clc.red.bold("The file not contain links"));
                        }

                        console.log("-----------------------------------------",  "\n");


                    })
                    .catch((e) => {
                        console.log("e", e);
                    });
            });
        } else {
            shell.echo("\n");
            shell.echo(clc.red.bold("Sorry, you need to provide a file path"));
        }
    })
    .catch((error) => {
        console.log(error);
    });
