declare const crypto: {
    RSA: {
        encrypt: (secretKey: any, pem: any) => Promise<any>;
    };
    AES: {
        createKey: () => Promise<Uint8Array>;
        encrypt: (data: any, rawKey: any) => Promise<string>;
        decrypt: (ciphertext: any, rawKey: any) => Promise<ArrayBuffer>;
        exportCryptoKey: (key: any) => Promise<Uint8Array>;
    };
    str2ab: (str: string) => ArrayBuffer;
    ab2str: (buf: any) => any;
};
export default crypto;
