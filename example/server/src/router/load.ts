import { get, post } from 'koa-router-decors';
import { Readable } from 'stream';
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

    @post('/bigpipe/stream')
    public async streamData(ctx) {
        ctx.set('Content-Type', 'text/event-stream; charset=utf-8'); // SSE 流
        ctx.set('Cache-Control', 'no-cache');
        ctx.set('Connection', 'keep-alive');

        const stream = new Readable({
            read() {},
        });

        ctx.status = 200;
        ctx.body = stream;

        const messages = [
            '你好，',
            '我是一个 AI 模型，',
            '正在模拟流式响应。',
            '这是一条测试消息，',
            '数据将逐步返回，',
            '以模拟 OpenAI API 的效果。',
            '你可以使用 onData 监听流数据，',
            '让界面实时显示 AI 生成的文本。',
            '流式数据传输结束。',
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < messages.length) {
                stream.push(messages[index] + '\n'); // 逐步推送
                index++;
            } else {
                clearInterval(interval);
                stream.push(null); // 结束流
            }
        }, 300);
    }
}
