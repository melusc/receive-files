/*!
 * This file is part of receive-files, software to easily receive files
 * over the network.
 * Copyright (C) 2026, Luca Schnellmann <oss@lusc.ch>

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {stat} from 'node:fs/promises';
import path from 'node:path';
import process, {cwd} from 'node:process';
import {parseArgs as utilityParseArguments} from 'node:util';

import getPort from 'get-port';

function printHelp() {
	console.log(`
	Usage
	  $ receive-files [path]
	  [path] The path to write the files to, defaults to current dir

	Options
		--port, -p     The port to run the server on, default 4444
		--confirm, -c  Wait for confirmation before saving file
		--help, h      Show this text and exit
`);

	process.exit(0);
}

export type Config = {
	port: number;
	confirm: boolean;
	outDirectory: string;
};

export async function parseArguments(): Promise<Config> {
	const {positionals, values} = utilityParseArguments({
		allowNegative: true,
		strict: true,
		options: {
			confirm: {
				type: 'boolean',
				short: 'c',
				default: true,
			},
			port: {
				type: 'string',
				short: 'p',
				default: '4444',
			},
			help: {
				type: 'boolean',
				short: 'h',
				default: false,
			},
		},
		allowPositionals: true,
	});

	const {help, confirm} = values;

	if (help) {
		printHelp();
	}

	const outDirectory = path.resolve(positionals[0] ?? cwd());

	const port = Number.parseInt(values.port);
	if (!Number.isSafeInteger(port) || port < 0) {
		console.error('Received invalid port "%s".', values.port);
		process.exit(1);
	}

	const isDirectory = await checkIsDirectory(outDirectory);
	if (!isDirectory) {
		console.error('"%s" is not a directory or does not exist.', outDirectory);
		process.exit(1);
	}

	const availablePort = await getPort({
		port: new Set([port, 4444]),
	});

	if (availablePort !== port) {
		console.log('Using port %s because %s is in use', availablePort, port);
		console.log();
	}

	return {
		port: availablePort,
		confirm,
		outDirectory,
	};
}

async function checkIsDirectory(path: string): Promise<boolean> {
	try {
		// Only used to check if directory exists
		// Path comes from command line flags so trusted
		const stats = await stat(path);
		return stats.isDirectory();
	} catch (error: unknown) {
		const nodeError = error as NodeJS.ErrnoException;

		if (nodeError.code === 'ENOENT') {
			return false;
		}

		throw error;
	}
}
