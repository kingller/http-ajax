const crypto = {
    RSA: {
        encrypt: async (secretKey, pem) => {
            const pemHeader = '-----BEGIN PUBLIC KEY-----';
            const pemFooter = '-----END PUBLIC KEY-----';
            const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
            const binaryDerString = window.atob(pemContents);
            const binaryDer = crypto.str2ab(binaryDerString);
            const publicKey = await window.crypto.subtle.importKey(
                'spki',
                binaryDer,
                {
                    name: 'RSA-OAEP',
                    hash: 'SHA-256',
                },
                true,
                ['encrypt']
            );
            const encryptedKey = await window.crypto.subtle.encrypt(
                {
                    name: 'RSA-OAEP',
                },
                publicKey,
                secretKey
            );

            return encryptedKey;
        },
    },
    AES: {
        createKey: async () => {
            const key: CryptoKey = await window.crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 128,
                },
                true,
                ['encrypt', 'decrypt']
            );
            return key;
        },

        encrypt: async (data, key?) => {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const ciphertext = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv,
                },
                key,
                data
            );
            return ciphertext;
            console.log('🚀 ~ file: crypto.ts ~ line 49 ~ encrypt: ~ ciphertext', ciphertext);
        },
    },

    str2ab: (str: string) => {
        const buf: ArrayBuffer = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    },
};

export default crypto;
