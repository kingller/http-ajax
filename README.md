# http-ajax
Promise based HTTP client for the browser


## Install

```bash
npm install http-ajax
``` 


## Demo

[在线示例](https://kingller.github.io/http-ajax/)

本地运行example示例
```
cd example
npm install
npm start

cd example/server
npm install
npm start
```
打开本地网址[http://localhost:9700/app](http://localhost:9700/app)访问


## Usage


### config 配置项

```
import ajax, { Ajax } from 'http-ajax';
import cryptoExtend from 'http-ajax/dist/crypto-extend';
import signatureExtend from 'http-ajax/dist/signature-extend';
import _ from 'lodash';

const { beforeSend, processData } = ajax;

ajax.config({
    /**
     * Get请求是否添加随机字符串阻止缓存
     * @default true
     */
    noCache: true,
    /**
     * url前缀
     * @default '/api'
     */
    prefix: '/api',
    /**
     * 成功失败标志字段
     * @default 'result'
     */
    statusField: 'result',
    /**
     * 成功回调
     */
    onSuccess: <T = any>(
        xhr: XMLHttpRequest,
        {
            response,
            options,
            resolve,
            reject,
        }: { 
            response: Ajax.IResult; 
            options: Ajax.IOptions; 
            resolve: Ajax.IResolve<T>; 
            reject: Ajax.IReject;
        }
    ): void => {
        // 处理成功回调
        // 下面是默认处理代码
        const { statusField } = ajax.getConfig();
        if (response[statusField]) {
            if (response.confirmMsg) {
                delete response[statusField];
                resolve(response as T);
            } else {
                if (response.warnMsg) {
                    window.$feedback(response.warnMsg, 'warning');
                }
                resolve(response.data as T);
            }
        } else if (response[statusField] === false) {
            reject(response);
            if (options && options.autoPopupErrorMsg === false) {
                return;
            }
            window.$feedback(response.errorMsg);
        } else {
            resolve(response as T);
        }
    },
    /**
     * 失败回调
     */
    onError: <T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void => {
        // 处理错误回调
        // 下面是默认处理代码
        const error = {
            errorCode: xhr.status,
            errorMsg: xhr.statusText,
        };
        this.catchError(
            Object.assign(
                {
                    remark: `ajax: ${_opts.method} ${_opts.url} params: ${JSON.stringify(_opts.params)}`,
                },
                error
            )
        );
        if (xhr.status === 401 || xhr.status === 406) {
            this.onSessionExpired<T>(error, _opts);
        } else {
            _opts.reject(xhr);
        }
    },
    /**
     * 自定义加载进度条
     */
    getLoading: (options: Ajax.IOptions): {
        start: () => void;
        finish: () => void;
    } => {
        // 自定义加载进度条显示
        // 必须返回一个对象 { start: () => void; finish: () => void; }
        // 调用ajax.loadable时会调用start显示进度条，请求结束调用finish结束进度条
        return {
            start: () => {
                // 添加显示loading逻辑
                console.log('start loading');
            },
            finish: () => {
                // 添加隐藏loading逻辑
                console.log('end loading');
            },
        }
    },
    /**
     * 请求发送前
     */
    beforeSend: (props: {
        method: Ajax.IMethod;
        url: string;
        params: Ajax.IParams;
        options: Ajax.IOptions;
    }): Ajax.IRequestResult | void => {
        let { options } = props;
        // 添加默认请求头
        _.defaultsDeep(options, {
            headers: {
                version: '1.0',
                dataFrom: 0,
            },
        });
        return beforeSend(props);
    },
    /**
     * 数据处理
     */
    processData: (params: Ajax.IParams, props: { method: Ajax.IMethod; url: string; options: Ajax.IOptions }): Ajax.IParams => {
        // 自定义处理 params，比如 trim
        // ...
        return processData(params, props);
    },
    /** 捕获错误 */
    catchError: (props: Ajax.ICatchErrorOptions): void => {
        // 这里可以自定义记录错误日志
    }
});

// 添加加解密扩展
ajax.extend(cryptoExtend());

// 添加签名扩展
ajax.extend(signatureExtend());
```


### 发送请求

#### get请求

```
import ajax from 'http-ajax';

// 发送get请求
ajax.get<T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions).then((data) => {
    this.data = data;
});

// 发送get请求，并显示加载进度条
ajax.loadable.get<T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions).then((data) => {
    this.data = data;
});
```

#### post请求

```
import ajax from 'http-ajax';

// 发送post请求
ajax.post<T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions).then((data) => {
    this.data = data;
});

// 发送post请求，并显示加载进度条
ajax.loadable.post<T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions).then((data) => {
    this.data = data;
});
```

#### put请求

```
import ajax from 'http-ajax';

// 发送put请求
ajax.put<T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions).then((data) => {
    this.data = data;
});

// 发送put请求，并显示加载进度条
ajax.loadable.put<T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions).then((data) => {
    this.data = data;
});
```

#### delete请求

```
import ajax from 'http-ajax';

// 发送delete请求
ajax.del<T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions).then((data) => {
    this.data = data;
});

// 发送delete请求，并显示加载进度条
ajax.loadable.del<T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions).then((data) => {
    this.data = data;
});
```


### 参数 options

#### processData
boolean.  
为false时不格式化请求参数。

#### json
boolean.  
为false时不调用JSON.parse处理返回值。

#### autoPopupErrorMsg
boolean.  
为false时，不弹出错误提示。

#### responseType
'' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'  
设置请求responseTyp

#### cache
boolean  
设置为true，缓存本次请求到的数据

#### onData
(data: any) => void  
当陆陆续续获取数据片段时的回调函数

#### onProgress
(e?: ProgressEvent) => void  
上传文件进度

#### headers
设置请求头

#### encrypt
'all' | string[]  
加密字段


## 兼容性
兼容各主流浏览器。兼容IE需引入`@babel/polyfill`。  

安装
```
npm install @babel/polyfill
```

入口文件开头加上
```
import '@babel/polyfill';
```

或在HTML页面中加上`@babel/polyfill`的CDN资源引用。
