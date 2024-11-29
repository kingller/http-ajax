标签：
<font color=green>新增</font>
<font color=orange>修改</font>
<font color=blue>增强</font>
<font color=red>修复</font>
<font color=red><strong>删除</strong></font>


# Next

1. <font color=blue>增强</font> `config` 配置项添加 `transformRequest` 自定义请求配置，可对请求的 url、请求参数、请求头等进行修改

# 9.0.0
> 2024.11.25  
1. <font color=orange>修改</font> 加解密扩展中用来传输 `AES` 密钥的 `RSA` 加密从 `pkcs1` 填充模式改为 `OAEP` 填充模式结合 `SHA256` 哈希算法，因为 `nodejs` 从 `18.20` 开始不再支持 `pkcs1` 填充模式。


# 8.1.0
> 2024.08.15  
1. <font color=green>新增</font> `clearCacheByUrl` 用来清除指定 `url` 的缓存


# 8.0.0
> 2024.01.05  
1. <font color=orange>修改</font> `ajax.config` 配置 `beforeSend`、`processData`、`responseEnd` 不再覆盖原方法，传入后仍会执行原方法


# 7.2.0
> 2024.01.05  
1. <font color=green>新增</font> `processError` 自定义错误处理，返回 false 则不再往下执行


# 7.1.0
> 2023.11.07  
1. <font color=orange>修改</font> 请求不传 `loadingName` 时 `loadingExtend` 的 `getLoading` 使用全局 `$loading` 作为参数


# 7.0.1
> 2023.10.13  
1. <font color=red>修复</font> 对大文件进行签名时报错，改为将文件读成 `ArrayBuffer`，并只对前 `10M` 文件内容进行签名


# 7.0.0
> 2023.09.21  
1. <font color=orange>修改</font> `processParamsAfter` 支持异步函数，修改至 `stringifyParams` 后执行
2. <font color=green>新增</font> 对文件进行签名，并添加至请求头 `file-sum`
3. <font color=green>新增</font> `options` 增加参数 `isSignFile` 用来设置是否要对文件进行签名


# 6.2.0
> 2023.06.19  
1. <font color=blue>增强</font> `loadingName` 支持 `string | symbol` 类型
2. <font color=orange>修改</font> `beforeSend` 参数属性名 `loadable` 改为 `loading`，统一命名


# 6.1.0
> 2023.06.16  
1. <font color=orange>修改</font> 请求不传 `loadingName` 时 `loadingExtend` 的 `getLoading` 也生效，以支持全部自定义显示 `loading`


# 6.0.0
> 2023.06.16  
1. <font color=orange>修改</font> 控制 `loading` 显示/隐藏改为使用 `loadingExtend`，需要用户添加该扩展
```
import ajax, { Ajax } from 'http-ajax';
import loadingExtend from 'http-ajax/dist/loading-extend';

// 添加显示loading扩展
ajax.extend(loadingExtend());
```


# 5.10.0
> 2023.06.01  
1. <font color=orange>修改</font> 判断是否 `open api` 从判断响应体是否有 `apiVersion` 字段，改为判断是否有 `code` 和 `details` 字段


# 5.9.0
> 2023.05.23  
1. <font color=green>新增</font> `options` 增加参数 `params` ，支持传入 query parameters，发送请求时拼接到 URL 上
2. <font color=red><strong>删除</strong></font> `processDataAfter`


# 5.8.1
> 2023.02.14  
1. <font color=red>修复</font> 编译时 `pandora-jsencrypt` 包报错 Can't resolve './JSEncrypt'


# 5.8.0
> 2023.02.14  
1. <font color=red><strong>删除</strong></font> `client-crypto` 包删除 `RSA` 签名方式 `md2`, `md5`, `sha1`


# 5.7.0
> 2023.02.02  
1. <font color=red>修复</font> 请求 `onError` 无法获取请求头
2. <font color=orange>修改</font> 重发请求使用前一请求相同的链路追踪 ID


# 5.6.0
> 2022.10.20  
1. <font color=green>新增</font> `sendRequest` 添加传递参数 `_retryTimes` 第几次重试


# 5.5.0
> 2022.08.23  
1. <font color=green>新增</font> 请求支持设置 `timeout` 最大请求时间（毫秒），若超出该时间，请求会自动终止


# 5.4.1
> 2022.03.07  
1. <font color=red>修复</font> 使用`onData`分段返回数据，请求报错时无法获取错误状态


# 5.4.0
> 2022.01.27  
1. <font color=orange>修改</font> `uuid`版本从`3.3.3`更新至`8.3.2`


# 5.3.1
> 2021.11.17  
1. <font color=red>修复</font> 请求返回`data`为`null`时报错


# 5.3.0
> 2021.11.15  
1. <font color=blue>增强</font> 请求第三个参数添加选项`simple`，不添加默认请求头，用来发送简单请求


# 5.2.0
> 2021.09.14  
1. <font color=green>新增</font> 支持如下请求响应格式
```
{
    code: 200,
    reason: 'test',
    message: '获取成功',
    details: {},
    apiVersion: '',
}
```


# 5.1.0
> 2021.06.29  
1. <font color=blue>增强</font> 增加链路追踪ID传参`xCorrelationID`
2. <font color=green>新增</font> `responseEnd`请求结束回调方法


# 5.0.1
> 2021.05.13  
1. <font color=red>修复</font> IE安全模式下获取`window.localStorage`报错，添加`try catch`捕获错误


# 5.0.0
> 2021.04.20  
1. <font color=red>修复</font> 请求签名时时间戳错误的加上了时区，现在把时区移除，使用世界时


# 4.0.4
> 2021.03.03  
1. <font color=red><strong>删除</strong></font> 移除`jsencrypt`中`YUI`版本说明


# 4.0.3
> 2021.01.08  
1. <font color=red>修复</font> `ajax`使用缓存且设置了loadable时，第二次取cache会显示loading，且loading不会消失


# 4.0.2
> 2020.12.22  
1. <font color=red>修复</font> `ajax`的`clone`方法没有成功克隆签名扩展


# 4.0.1
> 2020.12.16  
1. <font color=red>修复</font> 签名时未去除`url`中`:params`格式参数


# 4.0.0
> 2020.11.13  
1. <font color=orange>修改</font> 在参数为`FormData`或空时也进行签名，以支持阻止重放
2. <font color=red>修复</font> 签名时间戳`timestamp`计算世界时时修复为减去时区（原来逻辑错误再次加上了时区）


# 3.6.2
> 2020.10.29  
1. <font color=red>修复</font> 加解密请求同时发送多个并返回状态470（密钥过期）时，重新获取秘钥请求发送了多个，改为发送一个


# 3.6.1
> 2020.10.15  
1. <font color=red>修复</font> 判断链路追踪字段`X-Correlation-ID`改为忽略大小写


# 3.6.0
> 2020.10.15  
1. <font color=orange>修改</font> 链路追踪字段`X-Request-Id`改为`X-Correlation-ID`


# 3.5.2
> 2020.09.22  
1. <font color=red>修复</font> 签名参数名混淆


# 3.5.1
> 2020.09.22  
1. <font color=red>修复</font> Refused to get unsafe header "encrypt"


# 3.5.0
> 2020.08.18  
1. <font color=blue>增强</font> `url`以`http://`或`https://`开头的不再自动添加`prefix`
2. <font color=blue>增强</font> `url`支持包含参数，示例`example/:params`，`:params`代表参数（以 : 开头）


# 3.4.0
> 2020.08.11  
1. <font color=blue>增强</font> 参数`options`添加`transformResponse`，自定义响应数据
```
    /** 自定义响应数据 */
    transformResponse?: (
        /** 数据 */
        data: any,
        /** 响应头 */
        headers?: { [name: string]: any }
    ) => any;
```
2. <font color=red>修复</font> 启用数据缓存及加解密的，改为解密后缓存


# 3.3.0
> 2020.07.30  
1. <font color=orange>修改</font> 参数`options`的`responseType`有值时，不再调用`JSON.parse`处理返回值
2. <font color=orange>修改</font> 参数`options`的`headers`属性`X-Request-Id`和`token`传递空值时，不再将其设至Request Header


# 3.2.1
> 2020.07.29  
1. <font color=red>修复</font> 数据分段传输回调`onData`未匹配内容含有回车情况


# 3.2.0
> 2020.07.21  
1. <font color=orange>修改</font> `noCache`默认值改为false，阻止IE缓存改为添加请求头`Cache-Control:no-cache`,`Pragma:no-cache`，并且`noCache`参数将会在下个版本`4.0.0`废弃。
2. <font color=orange>修改</font> `processResponse`在http状态码`204`时也执行。
3. <font color=orange>修改</font> 加解密扩展的`processErrorResponse`改为先执行原`processErrorResponse`
4. <font color=orange>修改</font> `request`从`private`方法改为`public`方法
5. <font color=green>新增</font> 导出`isFormData`方法，用来判断是否`FormData`
6. <font color=green>新增</font> 导出`promisify`方法，用来将值转换为`Promise`


# 3.1.2
> 2020.06.04  
1. <font color=red>修复</font> 编译时警告`Module not found: Error: Can't resolve 'null'`


# 3.1.1
> 2020.06.02  
1. <font color=red>修复</font> 打包时把node crypto module也打包进了文件中


# 3.1.0
> 2020.06.02  
1. <font color=blue>增强</font> 将`lodash`引用从ajax基础包里移除, 减少基础包大小。加解密及签名扩展仍保持该依赖。


# 3.0.0
> 2020.05.29  
1. <font color=orange>修改</font> 发送`GET`请求时签名不再对value使用`encodeURIComponent`编码


# 2.1.0
> 2020.05.29  
1. <font color=blue>增强</font> `sendRequest`参数支持传入对象
```
    /**
     * 发送请求
     */
    sendRequest<T>(props: {
        /**
         * method
         * 'GET' | 'POST' | 'PUT' | 'DELETE'
         */
        method: Ajax.IMethod;
        /** url */
        url: string;
        /** 请求参数 */
        params?: Ajax.IParams | undefined;
        /** 是否显示loading */
        loading: boolean;
        /** resolve */
        resolve: Ajax.IResolve<T>;
        /** reject */
        reject: Ajax.IReject;
        /** options */
        options?: Ajax.IOptions;
        /** 取消请求方法 */
        cancelExecutor: Ajax.ICancelExecutor;
        /** 请求session过期回调 */
        onSessionExpired?: Ajax.IOnSessionExpired;
    }): Promise<any>;

    /**
     * 发送请求
     */
    sendRequest<T>(
        /** method */
        method: Ajax.IMethod, 
        /** url */
        url: string, 
        /** 请求参数 */
        params: Ajax.IParams | undefined, 
        /** 是否显示loading */
        loading: boolean, 
        /** resolve */
        resolve: Ajax.IResolve<T>, 
        /** reject */
        reject: Ajax.IReject, 
        /** 请求session过期回调 */
        onSessionExpired: Ajax.IOnSessionExpired, 
        /** options */
        options: Ajax.IOptions, 
        /** 取消请求方法 */
        cancelExecutor: Ajax.ICancelExecutor
    ): Promise<any>;
```


# 2.0.2
> 2020.05.28  
1. <font color=red>修复</font> 使用`ajax.clone`时没有克隆`onCryptoExpired`, `getLoading`, `catchError`, `clear`
2. <font color=red>修复</font> 使用`sendRequest`再次发送请求时，无法取消请求


# 2.0.1
> 2020.05.26  
1. <font color=orange>修改</font> 发送请求时请求头`Content-Type: application/json; charset=utf-8`改为`Content-Type: application/json;charset=utf-8`，移除`application/json;`和`charset=utf-8`中间空格


# 2.0.0
> 2020.05.26  
1. <font color=orange>修改</font> 加解密扩展及签名扩展不再默认导出，改为需要时再导入
```
import ajax from 'http-ajax';

// 添加加解密扩展
ajax.extend(ajax.cryptoExtend());

// 添加签名扩展
ajax.extend(ajax.signatureExtend());
```
改为
```
import ajax from 'http-ajax';
import cryptoExtend from 'http-ajax/dist/crypto-extend';
import signatureExtend from 'http-ajax/dist/signature-extend';

// 添加加解密扩展
ajax.extend(cryptoExtend());

// 添加签名扩展
ajax.extend(signatureExtend());
```


# 1.2.0
> 2020.05.25  
1. <font color=blue>增强</font> `config`配置项添加`catchError`捕获错误，记录日志
2. <font color=blue>增强</font> 暴露`AjaxBase`


# 1.1.0
> 2020.05.25  
1. <font color=blue>增强</font> `config`配置项添加支持`beforeSend`和`processData`
