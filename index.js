
import { rl } from './variables.js';
import { printCommandPrompt, printCurrentDirectory } from './utilsModule.js';

import { processCommand } from './processCommand.js';

//Get the current working directory
let currentDirectory = process.cwd();

const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));
const userName = usernameArg ? usernameArg.split('=')[1] : '';

if (!userName) {
    console.error('Error: Username is missing.');
    console.log('Please provide the --username argument when starting the program.');
    process.exit(1);
}


console.log(`Welcome to the File Manager, ${userName}!`);





printCurrentDirectory(currentDirectory);
printCommandPrompt();



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

