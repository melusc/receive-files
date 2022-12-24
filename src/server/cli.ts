import {opendir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cwd, exit} from 'node:process';

import meow from 'meow';

import {Server} from './index.js';

const _ = meow(
	`

	Usage
	  $ file-receiver [path]
	  [path] The path to write the files to, defaults to current dir

	Options
		--port, -p  The port to run the server on, default 4444

`,
	{
		allowUnknownFlags: false,
		importMeta: import.meta,
		flags: {
			port: {
				alias: 'p',
				type: 'number',
				default: 4444,
			},
		},
	},
);

const path = resolve(_.input[0] ?? cwd());

try {
	await opendir(path);
} catch {
	console.error('"%s" is not a directory', path);
	exit(1);
}

const server = new Server(_.flags.port, path);

console.log(server.port);
