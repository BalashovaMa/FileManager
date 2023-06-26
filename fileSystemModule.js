import { createReadStream, createWriteStream, unlink } from 'fs';
import fs from 'fs/promises';
import path from 'path';

//Get the current working directory
let currentDirectory = process.cwd();

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

        readable.on('end', () => console.log('\nReading file ended'));

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

        await fs.unlink(sourcePath);

        console.log('File moved successfully.');
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

export {
    printDirectoryContents,
    cat,
    createEmtyFile,
    renameFile,
    copyFile,
    moveFile,
    removeFile
}