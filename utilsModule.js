//Get the current working directory
let currentDirectory = process.cwd();

function printCommandPrompt() {
    console.log('Enter a command:');
}

function printCurrentDirectory(currentDirectory) {
    console.log(`You are currently in ${currentDirectory}`);
}

export { printCommandPrompt, printCurrentDirectory };