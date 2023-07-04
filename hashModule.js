import { createReadStream } from 'fs';
import crypto from 'crypto';

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

export { calculateFileHash };