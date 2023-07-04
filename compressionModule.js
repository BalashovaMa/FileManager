import exp from 'constants';
import { createReadStream, createWriteStream } from 'fs';
import zlib from 'zlib';

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

export { compressFile, decompressFile };