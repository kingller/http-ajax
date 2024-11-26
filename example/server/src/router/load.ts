import { get, post } from 'koa-router-decors';
import utils from '../utils/index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default class Load {
    @get('/load')
    public async getLoad(ctx) {
        await new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
        if (Math.floor(Math.random() * 1000) % 2) {
            ctx.status = 402;
        }
        ctx.body = {
            result: true,
        };
    }

    @get('/load2')
    public async getLoad2(ctx) {
        await new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
        ctx.body = {
            result: false,
            errorCode: '',
            errorMsg: '请求失败',
        };
    }

    @get('/cloud/rebuildToken')
    public async rebuildToken(ctx) {
        ctx.body = {
            result: true,
            data: {
                token: Buffer.from(utils.uuid()).toString('base64'),
                refreshToken: Buffer.from(utils.uuid()).toString('base64'),
            },
        };
    }

    @post('/bigpipe/ajax')
    public async bigPipeByAjax(ctx) {
        ctx.res.writeHead(200, { 'Content-Type': 'text/html', 'Transfer-Encoding': 'chunked' });
        for (let i = 0; i < 10; i++) {
            await sleep(1000);
            const chunk = `<chunk>${i}</chunk>`;
            ctx.res.write(chunk);
        }
        ctx.res.end();
    }
}
