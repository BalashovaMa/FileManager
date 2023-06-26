import os from 'os';


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

export {
    outputEOL,
    getInformationAboutCPU,
    getHomeDir,
    getArchitecture,
    getCurrentUserName
}