const crypto = {
    RSA: {
        encrypt: async (secretKey, publicKey) => {
            const rawPublicKey = crypto.str2ab(publicKey);
            const newPublicKey = await window.crypto.subtle.importKey(
                'spki',
                rawPublicKey,
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
                newPublicKey,
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
