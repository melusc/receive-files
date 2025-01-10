import {fileURLToPath} from 'node:url';

import express from 'express';
import multer, {memoryStorage} from 'multer';

import {parseArguments as parseArguments} from './arguments.ts';
import {saveFile} from './save-file.ts';
import {getNetworkAddress} from './util.ts';

const config = await parseArguments();

const staticDistributionDirectory = fileURLToPath(
	import.meta.resolve('client'),
);
const multerUpload = multer({
	storage: memoryStorage(),
	limits: {
		// ~100 MB
		fileSize: 100_000_000,
	},
});

const app = express();
app.get('/', (_request, response, next) => {
	response.sendFile(
		'index.html',
		{
			root: staticDistributionDirectory,
		},
		error => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (error) {
				next();
			}
		},
	);
});
app.get('/index.html', (_request, response) => {
	response.redirect('/');
});

app.post('/upload', multerUpload.array('file'), (request, response) => {
	if (request.files && Array.isArray(request.files)) {
		saveFile(config.outDirectory, request.files, config.confirm);
	}

	response.redirect('/');
});

app.get(/.+/, (request, response, next) => {
	response.sendFile(
		request.path,
		{
			root: staticDistributionDirectory,
		},
		error => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (error) {
				next();
			}
		},
	);
});

app.use((_request, response) => {
	response.status(404).send('404 - Not found');
});

app.listen(config.port, () => {
	console.log('Running');

	console.log('- Local:	http://localhost:%s/', config.port);

	const localIpAddress = getNetworkAddress();
	if (localIpAddress) {
		console.log('- Network:	http://%s:%s/', localIpAddress, config.port);
	}

	console.log();
});
