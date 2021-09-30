import _ from 'lodash';

const crypto = {
    RSA: {
        encrypt: async (secretKeyStr, pem) => {
            //pem需要从字符串转化为CryptoKey类型
            //secretKey需要是ArrayBuffer类型
            const secretKey = crypto.str2ab(secretKeyStr);
            const pemHeader = '-----BEGIN PUBLIC KEY-----';
            const pemFooter = '-----END PUBLIC KEY-----';
            const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length - 1);
            if (!window.atob) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                console && console.error('`window.atob` is undefined');
            }
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

            // const secretKey = new TextEncoder().encode(secretKeyStr.toString('utf8'));
            const encryptedKey = await window.crypto.subtle.encrypt(
                {
                    name: 'RSA-OAEP',
                },
                publicKey,
                secretKey
            );

            const strEncryptedKey = crypto.ab2str(encryptedKey);
            return strEncryptedKey;
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
            const arrBufferSecretKey = await crypto.AES.exportCryptoKey(key);
            const secretKeyStr = crypto.ab2str(arrBufferSecretKey);
            return secretKeyStr;
        },

        encrypt: async (data, rawKey) => {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const tag = window.crypto.getRandomValues(new Uint8Array(128));
            const arrBufferKey = crypto.str2ab(rawKey);
            const secretKey = await window.crypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
                'encrypt',
                'decrypt',
            ]);
            const enc = new TextEncoder();
            const newData = enc.encode(data);
            const ciphertext = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv,
                    tagLength: 128,
                },
                secretKey,
                newData
            );

            const strIv = crypto.ab2str(iv);
            const strTag = crypto.ab2str(tag);
            const strCiphertext = crypto.ab2str(ciphertext);

            return `${strIv}${strTag}${strCiphertext}`;
        },
        decrypt: async (ciphertext, rawKey) => {
            const strIv = ciphertext.slice(0, 12);
            const strCiphertext = ciphertext.slice(12);
            const iv = crypto.str2ab(strIv);
            const newCiphertext = crypto.str2ab(strCiphertext);
            const secretKey = await window.crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, [
                'encrypt',
                'decrypt',
            ]);
            const data = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                secretKey,
                newCiphertext
            );
            return data;
        },

        exportCryptoKey: async (key) => {
            const exported = await window.crypto.subtle.exportKey('raw', key);
            const exportedKeyBuffer = new Uint8Array(exported);
            return exportedKeyBuffer;
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
    ab2str: (buf) => {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    },
};

export default crypto;
