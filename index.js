import { createReadStream, createWriteStream, unlink} from 'fs';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import os from 'os';

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

async function renameFile(oldName, newName) {
    try {
        await fs.rename(oldName, newName);
        console.log(`File ${oldName} renamed to ${newName} successfully`);
    } catch (error) {
        console.error('Error: ', error);
    }
}

function copyFile(sourcePath, destinationPath) {
    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destinationPath);

    readStream.pipe(writeStream);

    readStream.on('error', (error) => {
        console.error('Error reading the file:', error);
    });

    writeStream.on('error', (error) => {
        console.error('Error writing the file:', error);
    });

    writeStream.on('finish', () => {
        console.log('File copied successfully.');
    });
}

async function moveFile(sourcePath, destinationPath) {
    try {
      const readStream = createReadStream(sourcePath);
      const writeStream = createWriteStream(destinationPath);
  
      readStream.pipe(writeStream);
  
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
  
      unlink(sourcePath, (error) => {
        if (error) {
          console.error('Error deleting the source file:', error);
        } else {
          console.log('File moved successfully.');
        }
      });
    } catch (error) {
      console.error('Error moving the file:', error);
    }
  }

  async function removeFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log('File removed successfully.');
    } catch (error) {
      console.error('Error removing file:', error);
    }
  }

  function outputEOL() {
    const EOL = os.EOL;
    console.log('System End-Of-Line (EOL):', JSON.stringify(EOL));
  }

  function getInformationAboutCPU() {
    const cpus = os.cpus();
    console.log('Number of CPUs:', cpus.length);

    cpus.forEach((cpu, index) => {
        console.log(`CPU ${index + 1}:`);
        console.log('  Model:', cpu.model);
        console.log('  Speed:', cpu.speed / 1000, 'GHz');
  });
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
    } else if (command.startsWith('rn')) {
        const parts = command.split(' ');
        const filePath = parts[1];
        const newName = parts[2];
        renameFile(filePath, newName);
    } else if (command.startsWith('cp')) {
        const parts = command.split(' ');
        const sourcePath = parts[1];
        const destinationPath = parts[2];
        copyFile(sourcePath, destinationPath);
    } else if (command.startsWith('mv')) {
        const parts = command.split(' ');
        const sourcePath = parts[1];
        const destinationPath = parts[2];
        moveFile(sourcePath, destinationPath);
    } else if (command.startsWith('rm')) {
        const filePath = command.slice(3).trim();
        removeFile(filePath);
    } else if (command === 'os --EOL') {
        outputEOL();
    } else if (command === 'os --cpus') {
        getInformationAboutCPU();
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