# http-ajax
Promise based HTTP client for the browser

## Install

```bash
npm install http-ajax
``` 

## Usage

### config 配置项

```
import ajax from 'http-ajax';

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
    ): void {
        // 处理成功回调
        // ...
    },
    /**
     * 失败回调
     */
    onError: <T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void {
        // 处理错误回调
        _opts.reject(xhr);
    },
    getLoading: (options: Ajax.IOptions): {
        start: () => void;
        finish: (num?: number) => void;
    } {
        // 自定义加载进度条显示
        // 必须返回一个对象 { start: () => void; finish: (num?: number) => void; }
        // 调用ajax.loadable时会调用start显示进度条，请求结束调用finish结束进度条
    };
});

// 添加加解密扩展
ajax.extend(ajax.cryptoExtend());

// 添加签名扩展
ajax.extend(ajax.signatureExtend());
```

### get请求

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

### post请求

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

### put请求

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

### delete请求

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
