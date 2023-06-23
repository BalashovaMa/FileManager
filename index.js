import fs from 'fs';
import path from 'path';
import readline from 'readline';

//Get the home directory of the current user
const homeDirectory = process.env.HOME || process.env.USERPROFILE;

//Get the current working directory
let currentDirectory = process.cwd();

function printCurrentDirectory() {
    console.log(`You are currently in ${currentDirectory}`);
}

//Checking the valid path range before changing the current working directory
function changeDirectory(newDirectory) {
    const absolutePath = path.resolve(currentDirectory, newDirectory);
    if (!absolutePath.startsWith(homeDirectory)) {
        console.log('Invalid directory path');
        return;
    }
    currentDirectory = absolutePath;
    printCurrentDirectory();
}

const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));
const userName = usernameArg ? usernameArg.split('=')[1] : '';

if (!userName) {
    console.error('Error: Username is missing.');
    console.log('Please provide the --username argument when starting the program.');
    process.exit(1);
}


console.log(`Welcome to the File Manager, ${userName}!`);

function printCommandPrompt() {
    console.log('Enter a command:');
}

//create an interface for reading input from the console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

printCurrentDirectory();
printCommandPrompt();

function processCommand(command) {

    if (command === 'up') {
        //Change the current working directory to the parent directory
        const parentDirectory = path.dirname(currentDirectory);
        if (parentDirectory !== currentDirectory) {
            currentDirectory = parentDirectory;
            printCurrentDirectory();
        } else {
            console.log('Already at the root directory');
        }
    } else if (command === 'exit') {
        rl.close();
    } else {
        console.log('Invalid command');
    }
}

//waiting for the command to be entered in the console
rl.on('line', (input) => {
    processCommand(input.trim());
    printCommandPrompt();
});

//process the program completion event
rl.on('close', () => {
    console.log(`Thank you for using File Manager, ${userName}, goodbye!`);
    process.exit();
});