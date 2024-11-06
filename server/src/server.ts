import Router from '@koa/router';
import Koa from 'koa';
import {koaBody} from 'koa-body';

import {saveFile} from './save-file.ts';
import {sendStatic} from './send-static.ts';
import {getNetworkAddress} from './util.ts';

const staticDistributionDirectory = new URL(
	'../../client/dist/',
	import.meta.url,
);

export class Server {
	constructor(
		public readonly port: number,
		public readonly outDirectory: string,
		public readonly confirmSave: boolean,
	) {
		const app = new Koa();

		const router = new Router();
		router.get('/', this.index);
		router.get('/index.html', context => {
			context.redirect('/');
		});
		router.post('/upload', koaBody({multipart: true}), this.upload);
		router.get(/.+/, this.static);

		app.use(router.routes());

		app.listen(port, () => {
			console.log('Running');

			console.log('- Local:	http://localhost:%s/', port);

			const localIpAddress = getNetworkAddress();
			if (localIpAddress) {
				console.log('- Network:	http://%s:%s/', localIpAddress, port);
			}

			console.log();
		});
	}

	upload: Router.Middleware = context => {
		const file = context.request.files?.['file'];

		if (!file) {
			context.throw(400);
			return false;
		}

		try {
			saveFile(this.outDirectory, file, this.confirmSave);
		} catch {
			context.throw(500);
			return false;
		}

		context.body = 'Ok';
		context.redirect('/');
		return true;
	};

	index: Router.Middleware = async context =>
		sendStatic(context, 'index.html', staticDistributionDirectory);

	static: Router.Middleware = async context =>
		sendStatic(context, context.path, staticDistributionDirectory);
}
