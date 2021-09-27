declare const crypto: {
    RSA: {
        encrypt: (secretKey: any, publicKey: any) => Promise<ArrayBuffer>;
    };
    AES: {
        createKey: () => Promise<CryptoKey>;
        encrypt: (data: any, key?: any) => Promise<void>;
    };
    str2ab: (str: string) => ArrayBuffer;
};
export default crypto;
