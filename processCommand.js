import { existsSync } from 'fs';
import path from 'path';
import { printCurrentDirectory } from './utilsModule.js';
import {
    printDirectoryContents,
    cat,
    createEmtyFile,
    renameFile,
    copyFile,
    moveFile,
    removeFile
} from './fileSystemModule.js'
import { homeDirectory, rl } from './variables.js';
import {
    outputEOL,
    getInformationAboutCPU,
    getHomeDir,
    getArchitecture,
    getCurrentUserName
} from './osModule.js';
import { calculateFileHash } from './hashModule.js';
import { compressFile, decompressFile } from './compressionModule.js';


//Get the current working directory
let currentDirectory = process.cwd();



async function processCommand(command) {

    if (command === 'up') {
        //Change the current working directory to the parent directory
        let parentDirectory = path.dirname(currentDirectory);
        if (parentDirectory !== currentDirectory) {
            currentDirectory = parentDirectory;
            printCurrentDirectory(currentDirectory);
        } else {
            console.log('Already at the root directory');
        }
    } else if (command.startsWith('cd ')) {
        //Change the current working directory to the selected folder
        const targetDirectory = command.slice(3).trim();

        const absolutePath = path.join(currentDirectory, targetDirectory);

        if (!existsSync(absolutePath)) {
            console.log('Directory does not exist');
            return;
        }
        const relativePath = path.relative(homeDirectory, absolutePath);
        if (relativePath.startsWith('..')) {
            console.log('Invalid directory path');
            return;
        }
        currentDirectory = absolutePath;
        printCurrentDirectory(currentDirectory);
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

export { processCommand };