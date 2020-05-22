import { get } from 'koa-router-decors';

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
}
