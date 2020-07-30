标签：
<font color=green>新增</font>
<font color=orange>修改</font>
<font color=blue>增强</font>
<font color=red>修复</font>
<font color=red><strong>删除</strong></font>


# Next



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
