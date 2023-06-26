import { createReadStream, createWriteStream, unlink } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import os from 'os';
import crypto from 'crypto';
import zlib from 'zlib';
import { resolve } from 'url';

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

function getHomeDir() {
    const homedir = os.homedir();
    console.log('Home Directory:', homedir);
}

function getCurrentUserName() {
    const username = os.userInfo().username;
    console.log('Username:', username);
}

function getArchitecture() {
    const architecture = process.arch;
    console.log('Architecture:', architecture);
}

async function calculateFileHash(filePath) {
    try {
        const algorithm = 'sha256';

        const hash = crypto.createHash(algorithm);
        const stream = createReadStream(filePath);

        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', (error) => reject(error));
        });
    } catch (error) {
        throw new Error('Failed to calculate file hash');
    }
}


async function compressFile(sourcePath, destinationPath) {
    try {
        const readStream = createReadStream(sourcePath, { encoding: null });
        const writeStream = createWriteStream(destinationPath, { encoding: null });

        const brotliOptions = {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
            },
        };

        const compressStream = zlib.createBrotliCompress(brotliOptions);

        return new Promise((resolve, reject) => {
            readStream.pipe(compressStream).pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    } catch (error) {
        throw new Error('Failed to compress file');
    }
}

async function decompressFile(sourcePath, destinationPath) {
    try {
        const readStream = createReadStream(sourcePath, { encoding: null });
        const writeStream = createWriteStream(destinationPath, { encoding: null });

        const decompressStream = zlib.createBrotliDecompress();

        return new Promise((resolve, reject) => {
            readStream.pipe(decompressStream).pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    } catch (error) {
        throw new Error('Failed to compress file');
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
    } else if (command === 'os --homedir') {
        getHomeDir();
    }
    else if (command === 'os --username') {
        getCurrentUserName();
    } else if (command === 'os --architecture') {
        getArchitecture();
    } else if (command.startsWith('hash')) {
        const filePath = command.slice(5).trim();
        calculateFileHash(filePath)
            .then((hash) => console.log('File hash:', hash))
            .catch((error) => console.error('Error:', error));
    } else if (command.startsWith('compress')) {
        const parts = command.split(' ');
        const sourcePath = parts[1];
        const destinationPath = parts[2];
        console.log(sourcePath);
        console.log(destinationPath);
        compressFile(sourcePath, destinationPath)
            .then(() => console.log('File compressed successfully'))
            .catch((error) => console.error('Error:', error));
    } else if (command.startsWith('decompress')) {
        const parts = command.split(' ');
        const sourcePath = parts[1];
        const destinationPath = parts[2];
        console.log(sourcePath);
        console.log(destinationPath);
        decompressFile(sourcePath, destinationPath)
            .then(() => console.log('File decompressed successfully'))
            .catch((error) => console.error('Error:', error));
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