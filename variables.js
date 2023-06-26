import readline from 'readline';

//Get the home directory of the current user
const homeDirectory = process.env.HOME || process.env.USERPROFILE;

//create an interface for reading input from the console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


export { homeDirectory, rl };