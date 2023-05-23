import { get, post } from 'koa-router-decors';
import utils from '../../utils/index';
import * as _ from 'lodash';

function getSecretKey(ctx: any): string {
    // 使用 redis 时需先去 header 里获取 uuid 作为 key
    return ctx.session.secretKey;
}
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

    @get('/example/users/:userId')
    public async getUserData(ctx) {
        ctx.body = {
            result: true,
            data: {
                userId: ctx.request.query.userId,
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

    @post('/example/users/:userId')
    public async createUserData(ctx) {
        ctx.body = {
            result: true,
            data: {
                userId: ctx.request.query.userId,
                userName: ctx.request.query.userName,
            },
        };
    }
}
