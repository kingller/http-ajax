import { get, post } from 'koa-router-decors';
import * as RSA from 'node-rsa';
import * as _ from 'lodash';
import utils from '../../utils/index';

// ------ 固定 key start ------//
// const PUBLIC_KEY = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkjn1xHFOG8cGK47N8ZKvWn5pKFDUQ09pptq9Ja3zgzzWOtmJcSdNdJsCTiHyVSXDah1Y3A3xUzIKU03q5dg9UXq794VvJc4RpaSBD5gYmuCWBVtxjAf+mepfOlcy6kxiuxR8A6P7rwsoiXjpJgxN9y3IGfS1aNuCoNvRa2MLOAQIDAQAB';
// const PRIVATE_KEY = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAKSOfXEcU4bxwYrjs3xkq9afmkoUNRDT2mm2r0lrfODPNY62YlxJ010mwJOIfJVJcNqHVjcDfFTMgpTTerl2D1Rerv3hW8lzhGlpIEPmBia4JYFW3GMB/6Z6l86VzLqTGK7FHwDo/uvCyiJeOkmDE33LcgZ9LVo24Kg29FrYws4BAgMBAAECgYEAiwDSdfm3lQYit3Ag7bMcdO/dJTZsnQpYNXRcHWju0/g1BZiK/epe4REbG4TvuCuRaQdpjI8lN3yJ0a3SvVc9Gmk2WlL98Xc48qi6mffi3UxyLhXcOBDSeB9Xh29ZkdMi5cAysX5YaesVTJhfxI7IH/eJo35q5JHI7IOh99iPtQECQQDueRCODvI7O+uGSgXpZ57cWhF6xyXTxpTPZyaTtXvwLBVFuXTHeEU8FAtG8az0DunxQfx9stuv5H5M5kjQ/wprAkEAsKarSNRd7c16LczCVzIdGLCHy3Y/VwQNS4ZNteDIo90+Lnz+cDQwbKvFMk5ll4q5cKK+fhSGPMlEffcBxzY8QwJBAJU0EfOPzmbZOqcusTwzpOVhRQZ4i2ZRHNIXS7+nEQBX1IdnXXVf/pF0SQn+M6QPoLdd/cf3nBQU9iDPBEgfCjkCQBoWIsk4gz5wz5Af4rsZrW5N81+6cJQbBxOWG7e2ICsCqwIWd0R+kIAbxZ0uMpZ0Z/oYLmVUBpbHahPn/B09Bx0CQEft9YNnS8EfDL8gFVhiQ8ahFPEI4Ify1N6vSZf1bCVf+0dQp5Fwbo9MP1vbFtN6gBsimhvMaJUBT4fD+Q18u50=';

// const rsaKey = new RSA('-----BEGIN PRIVATE KEY-----' +
//     PRIVATE_KEY +
//     '-----END PRIVATE KEY-----');
// rsaKey.setOptions({
//     encryptionScheme: 'pkcs1'
// });
// ------ 固定 key end ------//

// ------ 生成 key start ------//
const rsaKey = new RSA({ b: 512 });
rsaKey.setOptions({
    encryptionScheme: 'pkcs1',
});
const PUBLIC_KEY = Buffer.from(rsaKey.exportKey('pkcs8-public-der')).toString('base64');
// ------ 生成 key end ------//

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
        const secretKey = rsaKey.decrypt(token, 'utf8');
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
            data = utils.decryptData(ctx.request.querystring, getSecretKey(ctx), encryptFields);
        } else {
            console.log(getSecretKey(ctx));

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
