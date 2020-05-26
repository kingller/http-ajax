/**
 * 加解密扩展。
 * 加密请求前未获取到密钥或返回470状态时，首先发送请求/api/encryption/public-key获取服务端RSA公钥。
 * 客户端生成AES密钥，并使用RSA加密后发送请求/api/encryption/token传输给服务端，服务端客户端使用该密钥加解密。
 * 请求头中将会添加字段uuid，encrypt（uuid:唯一标识码，服务端根据该uuid获取密钥；encrypt：加密字段，服务端根据该字段解密）。
 * 解密请求将会在响应头中添加字段encrypt：加密字段，客户端根据该字段解密。
 */
declare function cryptoExtend(): () => void;
export default cryptoExtend;
