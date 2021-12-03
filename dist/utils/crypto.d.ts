declare class RSA {
    constructor();
    webCrypto: any;
    Crypto: any;
    encrypt: (secretKeyStr: any, pem: any) => Promise<string>;
}
declare class AES {
    constructor();
    webCrypto: any;
    Crypto: any;
    private _key;
    createKey: () => Promise<string>;
    /** 设置秘钥 */
    setKey: (secretKey: string) => void;
    clearKey: () => void;
    encrypt: (data: any, rawKey?: any) => Promise<string>;
    decrypt: (ciphertext: any, rawKey?: any) => Promise<any>;
    exportCryptoKey: (key: any) => Promise<any>;
    textEncode: (str: any) => Promise<Uint8Array>;
    textDecode: (buf: any) => Promise<any>;
}
declare const Crypto: {
    RSA: RSA;
    AES: AES;
};
export default Crypto;
