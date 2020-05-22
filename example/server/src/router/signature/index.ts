import { get, post } from 'koa-router-decors';

export default class Encryption {
    @get('/example/signature')
    public async getData(ctx) {
        ctx.body = {
            result: true,
            data: {},
        };
    }

    @post('/example/signature')
    public async createData(ctx) {
        ctx.body = {
            result: true,
        };
    }
}
