'use strict';

import * as Koa from 'koa';
import * as serve from 'koa-static';
import * as bodify from 'koa-body';
import * as logger from 'koa-logger';
import * as router from 'koa-router-decors';
import * as sleep from 'koa-sleep';
import * as path from 'path';
import * as session from 'koa-session';

const CONFIG = {
    key: 'koa:sess' /** (string) cookie key (default is koa:sess) */,
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    autoCommit: true /** (boolean) automatically commit headers (default true) */,
    overwrite: true /** (boolean) can overwrite or not (default true) */,
    httpOnly: true /** (boolean) httpOnly or not (default true) */,
    signed: true /** (boolean) signed or not (default true) */,
    rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
    renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/,
    sameSite: null /** (string) session cookie sameSite options (default null, don't set it) */,
};

const app = new Koa();
app.keys = ['secret key'];
app.use(session(CONFIG, app));
app.use(sleep(1));
app.use(logger());
app.use(serve(`${__dirname}${path.sep}public`));
// 使用非严格模式，解析HTTP DELETE请求的请求体Body
app.use(
    bodify({
        multipart: true,
        // 使用非严格模式，解析HTTP DELETE请求的请求体Body
        strict: false,
        textLimit: '20mb',
    })
);

app.use(router.load('/api', `${__dirname}/router`, { extname: '.{ts,js}' }).routes());

const port = Number(process.env.npm_package_config_port) + 1;
app.listen(port);
// tslint:disable-next-line: no-console
console.log(`Local server started: http://localhost:${port}`);
