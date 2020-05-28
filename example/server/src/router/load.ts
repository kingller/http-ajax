import { get } from 'koa-router-decors';
import utils from '../utils/index';

export default class Load {
    @get('/load')
    public async getLoad(ctx) {
        await new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
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
}
