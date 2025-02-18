import {stat, writeFile} from 'node:fs/promises';
import path from 'node:path';

import confirm from '@inquirer/confirm';

let isRunning = false;
const queue: Array<{
	outDirectory: string;
	file: Express.Multer.File;
	filename: string;
	shouldConfirmSave: boolean;
}> = [];

// Avoid overwriting existing files
// Theoretically, there is the chance of a race condition where a file is
// created after we `stat` to check if it exists, but before we write the remote file
// We will not concern ourselves with that scenario because there is no built-in way
// to avoid this scenario and it seems unlikely to happen or difficult to exploit
async function getAvailableFilename(remoteName: string, outDirectory: string) {
	remoteName = path.basename(remoteName);

	// Check if remote name can be used without counter
	const localPath = path.join(outDirectory, remoteName);
	try {
		// Local path is safe because it uses `basename`
		// and only is relevant if the file doesn't exist
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		await stat(localPath);
	} catch {
		return localPath;
	}

	const remoteNameParts = remoteName.split('.');
	let stem: string;
	let suffix: string | undefined;
	if (remoteNameParts.length > 1) {
		stem = remoteNameParts.slice(0, -1).join('.');
		suffix = remoteNameParts.at(-1)!;
	} else {
		stem = remoteName;
		suffix = undefined;
	}

	let counter = 1;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	while (true) {
		let filename = `${stem} (${counter})`;
		if (suffix) {
			filename += `.${suffix}`;
		}

		const localPath = path.join(outDirectory, filename);

		try {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			await stat(localPath);
		} catch {
			return localPath;
		}

		++counter;
	}
}

async function handle() {
	if (isRunning) {
		return;
	}

	isRunning = true;

	while (queue.length > 0) {
		const {outDirectory, file, shouldConfirmSave, filename} = queue.shift()!;
		// Avoid saving outside of this directory
		const outPath = await getAvailableFilename(filename, outDirectory);

		let save = true;
		if (shouldConfirmSave) {
			save = await confirm({message: `Save ${path.basename(outPath)}`});
		}

		if (save) {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			await writeFile(outPath, file.buffer);
			console.log('Saved to "%s"', outPath);
		}
	}

	isRunning = false;
}

export function saveFile(
	outDirectory: string,
	files: Express.Multer.File[],
	shouldConfirmSave: boolean,
): void {
	for (const file of files) {
		let filename = file.originalname;

		if (!filename) {
			throw new Error('No filename provided');
		}

		filename = path.basename(filename);

		queue.push({
			outDirectory,
			file,
			shouldConfirmSave,
			filename,
		});
	}

	void handle();
}
