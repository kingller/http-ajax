import { get, post } from 'koa-router-decors';
import * as crypto from 'crypto';
import * as _ from 'lodash';
import utils from '../../utils/index';

// ------ 生成 key start ------//
function getKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 3072, // 模数的位数，即密钥的位数，2048 或以上一般是安全的
        publicExponent: 0x10001, // 指数值，必须为奇数，默认值为 0x10001，即 65537
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8', // 用于存储私钥信息的标准语法标准
            format: 'pem', // base64 编码的 DER 证书格式
        },
    });
}
const { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY } = getKeyPair();
// ------ 生成 key end ------//

function privateDecrypt(privateKey: string, encryptBuffer: NodeJS.ArrayBufferView) {
    const msgBuffer = crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
        encryptBuffer
    );

    return String.fromCharCode.apply(null, msgBuffer);
}

function checkSecretKey(ctx: any): boolean {
    if (!ctx.request.header.uuid || !ctx.session.secretKey) {
        // 密钥过期
        ctx.status = 470;
        return false;
    }
    return true;
}

function getSecretKey(ctx: any): string {
    // 使用 redis 时需先去 header 里获取 uuid 作为 key
    return ctx.session.secretKey;
}

export default class Encryption {
    @get('/encryption/public-key')
    public async getPublicKey(ctx) {
        ctx.body = {
            result: true,
            data: {
                publicKey: PUBLIC_KEY,
                uuid: Buffer.from(utils.uuid()).toString('base64'),
            },
        };
    }

    @post('/encryption/token')
    public async createSecretKey(ctx) {
        // 这里为方便演示，使用了 session。
        // 生产环境中请使用 redis 集群，key 为请求 header 中的 uuid。
        // 所有项目请共用该 redis
        const token = ctx.request.body.token;
        const arrayBufferToken = Buffer.from(token, 'base64');
        const secretKey = privateDecrypt(PRIVATE_KEY, arrayBufferToken);
        ctx.session.secretKey = secretKey;

        ctx.body = {
            result: true,
        };
    }

    @post('/example/encrypt')
    public async encryptData(ctx) {
        if (!checkSecretKey(ctx)) {
            return;
        }

        const encryptFields = JSON.parse(ctx.request.header.encrypt);
        const data = utils.decryptData(ctx.request.body, getSecretKey(ctx), encryptFields);

        ctx.body = {
            result: true,
            data,
        };
    }

    @get('/example/encrypt')
    public async encryptGetData(ctx) {
        if (!checkSecretKey(ctx)) {
            return;
        }

        let data;
        const encryptFields = JSON.parse(ctx.request.header.encrypt);

        if (encryptFields === 'all') {
            data = utils.decryptData(ctx.request.querystring.split(/&?_v=/)[0], getSecretKey(ctx), encryptFields);
        } else {
            data = utils.decryptData(_.omit(ctx.request.query, ['_v']), getSecretKey(ctx), encryptFields);
        }

        ctx.body = {
            result: true,
            data,
        };
    }

    @post('/example/decrypt')
    public async decryptData(ctx) {
        if (!checkSecretKey(ctx)) {
            return;
        }

        let data = {
            userId: 1,
            userName: '姓名',
            pwd: '123456',
            educationInfo: {
                degree: '本科',
                school: '北京大学',
            },
        };
        const encryptFields = ['pwd', 'educationInfo'];
        data = utils.encryptData(data, getSecretKey(ctx), encryptFields);

        ctx.body = {
            result: true,
            data,
        };
        ctx.set({
            encrypt: JSON.stringify(encryptFields),
        });
    }

    @post('/example/decrypt/decrypt-array')
    public async decryptDataArray(ctx) {
        if (!checkSecretKey(ctx)) {
            return;
        }

        let data = [
            {
                userId: 1,
                userName: '姓名 1',
                pwd: '123456',
            },
            {
                userId: 2,
                userName: '姓名 2',
                pwd: '236789',
            },
            {
                userId: 3,
                userName: '姓名 3',
                pwd: 'abcdef',
                employees: [
                    {
                        employeeId: '1',
                        employeeName: '张三',
                    },
                    {
                        employeeId: '2',
                        employeeName: '李四',
                    },
                ],
            },
        ];
        const encryptFields = [
            '${index}.pwd',
            '${index}.employees.${index}.employeeId',
            '${index}.employees.${index}.employeeName',
        ];
        data = utils.encryptData(data, getSecretKey(ctx), encryptFields);

        ctx.body = {
            result: true,
            data,
        };
        ctx.set({
            encrypt: JSON.stringify(encryptFields),
        });
    }

    @post('/example/decrypt/decrypt-all')
    public async decryptDataAll(ctx) {
        if (!checkSecretKey(ctx)) {
            return;
        }

        const encryptFields = 'all';
        const data = utils.encryptData(
            {
                userId: 1,
                userName: '姓名',
                pwd: '123456',
            },
            getSecretKey(ctx),
            encryptFields
        );

        ctx.body = {
            result: true,
            data,
        };
        ctx.set({
            encrypt: JSON.stringify(encryptFields),
        });
    }

    @post('/example/encrypt/upload')
    public async encryptUpload(ctx) {
        if (!checkSecretKey(ctx)) {
            return;
        }

        // 获取上传文件
        const data = utils.decryptData(ctx.request.body, getSecretKey(ctx), 'all');
        await new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
        ctx.body = {
            result: true,
            data,
        };
    }
}
