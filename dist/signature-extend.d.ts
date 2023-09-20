import './polyfill/form-data';
/**
 * 签名扩展。
 * 将会在请求头中添加字段 sign，timestamp，app-nonce。
 * sign：签名文本；
 * timestamp（签名参数）：UTC 时间（用于校验是否已过期）；
 * app-nonce（签名参数）：只使用一次标识码（用于校验是否已发送过，存入 redis 几分钟后过期）。
 */
declare function snExtend(): () => void;
export default snExtend;
