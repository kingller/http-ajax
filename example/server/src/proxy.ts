import * as http from 'http';
import * as httpProxy from 'http-proxy';
import './index';

const port = Number(process.env.npm_package_config_port);

// 这里可以配置多个包括本地模拟服务在内的多个后端地址
const config = {
    localhost: `http://localhost:${port + 1}`,
};
// 从`config`中获取其中一个后端地址。修改保存后服务自动重启完成切换。
// tslint:disable-next-line: no-string-literal
const target = config['localhost'];

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    if (/^\/api\/graphql/i.test(req.url)) {
        proxy.web(req, res, {
            target: 'http://localhost:7009',
        });
    } else if (/^\/api\/zeus\//i.test(req.url)) {
        proxy.web(req, res, {
            target: {
                protocol: 'https:',
                host: `zeustest.${Buffer.from('Z2FpYXdvcmtmb3JjZQ==', 'base64').toString()}.com`,
            },
            changeOrigin: true,
        });
    } else {
        proxy.web(req, res, {
            target,
        });
    }
});

server.listen(port);

// tslint:disable-next-line: no-console
console.log(`Proxy server started: http://localhost:${port} => ${target}`);

proxy.on('error', (err, req, res) => {
    // tslint:disable-next-line: no-console
    console.log(err);
});
