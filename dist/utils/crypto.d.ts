declare class RSA {
    constructor();
    webCrypto: any;
    Crypto: any;
    encrypt: (secretKeyStr: any, pem: any) => Promise<any>;
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
    encrypt: (data: any, rawKey?: any) => Promise<any>;
    decrypt: (ciphertext: any, rawKey?: any) => Promise<any>;
    exportCryptoKey: (key: any) => Promise<any>;
    textEncode: (str: any) => Uint8Array;
    textDecode: (buf: any) => any;
}
declare const Crypto: {
    RSA: RSA;
    AES: AES;
};
export default Crypto;
