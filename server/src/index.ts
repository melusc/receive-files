import Router from '@koa/router';
import Koa from 'koa';

import {sendStatic} from './send-static.js';

const staticDistDir = new URL('../../client/dist/', import.meta.url);

export class Server {
	constructor(public readonly port: number, public readonly path: string) {
		const app = new Koa();

		const router = new Router();
		router.get('/', this.index);
		router.get('/static/:filename', this.static);
		app.use(router.routes());

		app.listen(port, () => {
			console.log('Running at http://localhost:%s/', port);
		});
	}

	upload: Router.Middleware = ctx => {
		ctx.body = 'Upload';
	};

	index: Router.Middleware = async ctx =>
		sendStatic(ctx, 'index.html', staticDistDir);

	static: Router.Middleware = async ctx => {
		const {filename} = ctx.params;

		if (!filename) {
			ctx.throw(400);

			return;
		}

		return sendStatic(ctx, filename, staticDistDir);
	};
}
