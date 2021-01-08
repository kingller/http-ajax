import { get, post } from 'koa-router-decors';

export default class Encryption {
    @get('/example/user/:userId')
    public async getData(ctx) {
        ctx.body = {
            result: true,
            data: {
                userId: ctx.params.userId,
                userName: ctx.request.query.userName,
            },
        };
    }

    @post('/example/user/:userId')
    public async createData(ctx) {
        ctx.body = {
            result: true,
            data: {
                userId: ctx.params.userId,
                userName: ctx.request.body.userName,
            },
        };
    }
}
