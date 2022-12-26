import Router from '@koa/router';
import Koa from 'koa';
import {koaBody} from 'koa-body';

import {sendStatic} from './send-static.js';
import {saveFile} from './save-file.js';

const staticDistDir = new URL('../../client/dist/', import.meta.url);

export class Server {
	constructor(
		public readonly port: number,
		public readonly path: string,
		public readonly confirmSave: boolean,
	) {
		const app = new Koa();

		const router = new Router();
		router.get('/', this.index);
		router.get('/static/:filename', this.static);
		router.post('/upload', koaBody({multipart: true}), this.upload);
		router.all(/.+/, ctx => {
			ctx.redirect('/');
		});

		app.use(router.routes());

		app.listen(port, () => {
			console.log('Running at http://localhost:%s/', port);
		});
	}

	upload: Router.Middleware = async ctx => {
		const file = ctx.request.files?.['file'];

		if (!file) {
			ctx.throw(400);
			return false;
		}

		try {
			saveFile(this.path, file, this.confirmSave);
		} catch {
			ctx.throw(500);
			return false;
		}

		ctx.body = 'Ok';
		ctx.redirect('/');
		return true;
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
