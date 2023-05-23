/**
 * 加解密扩展。
 * 加密请求前未获取到密钥或返回 470 状态时，首先发送请求/api/encryption/public-key 获取服务端 RSA 公钥。
 * 客户端生成 AES 密钥，并使用 RSA 加密后发送请求/api/encryption/token 传输给服务端，服务端客户端使用该密钥加解密。
 * 请求头中将会添加字段 uuid，encrypt（uuid:唯一标识码，服务端根据该 uuid 获取密钥；encrypt：加密字段，服务端根据该字段解密）。
 * 解密请求将会在响应头中添加字段 encrypt：加密字段，客户端根据该字段解密。
 */
declare function cryptoExtend(): () => void;
export default cryptoExtend;
