import { createReadStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

//Get the home directory of the current user
const homeDirectory = process.env.HOME || process.env.USERPROFILE;

//Get the current working directory
let currentDirectory = process.cwd();

function printCurrentDirectory() {
    console.log(`You are currently in ${currentDirectory}`);
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

async function printDirectoryContents() {
    try {
        const contents = await fs.readdir(currentDirectory);
        const files = [];
        const directories = [];

        for (const item of contents) {
            const itemPath = path.join(currentDirectory, item);
            const stats = await fs.stat(itemPath);

            const fileInfo = {
                name: item,
                type: stats.isDirectory() ? 'Directory' : 'File',
            }

            if (stats.isDirectory()) {
                directories.push(fileInfo);
            } else {
                files.push(fileInfo);
            }
        }
        const sortedDirectories = directories.sort((a, b) => a.name.localeCompare(b.name));
        const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

        const table = [...sortedDirectories, ...sortedFiles].map((item, index) => ({
            index: index + 1,
            name: item.name,
            type: item.type,
        }));

        console.table(table, ['index', 'name', 'type']);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cat(filePath) {
    try {
        const readable = createReadStream(filePath, 'utf-8');

        readable.on('data', (chunk) => {
            process.stdout.write(chunk);
        });

        readable.on('end', () => console.log('Reading file ended'));

        readable.on('error', (error) => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function createEmtyFile(fileName) {
    try {
        const filePath = path.join(currentDirectory, fileName);

        await fs.writeFile(filePath, '');
        console.log(`File ${fileName} created successfully`)
    } catch (error) {
        console.log('Error: ', error);
    }
}

async function processCommand(command) {

    if (command === 'up') {
        //Change the current working directory to the parent directory
        const parentDirectory = path.dirname(currentDirectory);
        if (parentDirectory !== currentDirectory) {
            currentDirectory = parentDirectory;
            printCurrentDirectory();
        } else {
            console.log('Already at the root directory');
        }
    } else if (command.startsWith('cd ')) {
        //Change the current working directory to the selected folder
        const targetDirectory = command.slice(3).trim();

        const absolutePath = path.join(currentDirectory, targetDirectory);

        if (!fs.existsSync(absolutePath)) {
            console.log('Directory does not exist');
            return;
        }
        const relativePath = path.relative(homeDirectory, absolutePath);
        if (relativePath.startsWith('..')) {
            console.log('Invalid directory path');
            return;
        }
        currentDirectory = absolutePath;
        printCurrentDirectory();
    } else if (command === 'ls') {
        await printDirectoryContents();
    } else if (command.startsWith('cat')) {
        const filePath = command.slice(4).trim();
        cat(filePath);
    } else if (command.startsWith('add')) {
        const filePath = command.slice(4).trim();
        createEmtyFile(filePath);
    }
    else if (command === 'exit') {
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