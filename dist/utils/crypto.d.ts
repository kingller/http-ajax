declare class RSA {
    encrypt: (secretKeyStr: any, pem: any) => Promise<string>;
}
declare class AES {
    private _key;
    createKey: () => Promise<string>;
    /** 设置秘钥 */
    setKey: (secretKey: string) => void;
    clearKey: () => void;
    encrypt: (data: any, rawKey?: any) => Promise<string>;
    decrypt: (ciphertext: any, rawKey?: any) => Promise<any>;
    exportCryptoKey: (key: any) => Promise<ArrayBuffer>;
}
declare const webCrypto: {
    RSA: RSA;
    AES: AES;
};
export default webCrypto;
