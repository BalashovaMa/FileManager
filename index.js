import fs from 'fs';
import path from 'path';
import readline from 'readline';

//Get the home directory of the current user
const homeDirectory = process.env.HOME || process.env.USERPROFILE;

//Get the current working directory
const currentDirectory = process.cwd();

function printCurrentDirectory() {
    console.log(`You are currently in ${currentDirectory}`);
}

printCurrentDirectory();

const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));
const userName = usernameArg ? usernameArg.split('=')[1] : '';

if (!userName) {
    console.error('Error: Username is missing.');
    console.log('Please provide the --username argument when starting the program.');
    process.exit(1);
}


console.log(`Welcome to the File Manager, ${userName}!`);

process.on('SIGINT', () => {
    console.log(`Thank you for using File Manager, ${userName}, goodbye!`);
    process.exit();
});