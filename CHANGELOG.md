标签：
<font color=green>新增</font>
<font color=orange>修改</font>
<font color=blue>增强</font>
<font color=red>修复</font>
<font color=red><strong>删除</strong></font>


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
