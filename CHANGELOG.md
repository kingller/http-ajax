标签：
<font color=green>新增</font>
<font color=orange>修改</font>
<font color=blue>增强</font>
<font color=red>修复</font>
<font color=red><strong>删除</strong></font>


# 2.0.1
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
