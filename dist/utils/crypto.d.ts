declare const crypto: {
    RSA: {
        encrypt: (secretKeyStr: any, pem: any) => Promise<string>;
    };
    AES: {
        createKey: () => Promise<string>;
        encrypt: (data: any, rawKey: any) => Promise<string>;
        decrypt: (ciphertext: any, rawKey: any) => Promise<ArrayBuffer>;
        exportCryptoKey: (key: any) => Promise<Uint8Array>;
    };
    str2ab: (str: string) => ArrayBuffer;
    ab2str: (buf: any) => any;
};
export default crypto;
