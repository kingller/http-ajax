import _ from 'lodash';

const str2ab = (str: string) => {
    const buf: ArrayBuffer = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};

const ab2str = (buf) => {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};

class RSA {
    constructor() {
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;

        if (!webCrypto) {
            /* eslint-disable*/
            this.Crypto = require('client-crypto');
            /* eslint-enable */
        } else {
            this.webCrypto = webCrypto;
        }
    }

    webCrypto: any;

    Crypto: any;

    encrypt = async (secretKeyStr, pem) => {
        if (!this.webCrypto) {
            return this.Crypto.RSA.encrypt(secretKeyStr, pem);
        }
        // pem需要从字符串转化为CryptoKey类型
        // secretKey需要是ArrayBuffer类型
        const secretKey = str2ab(secretKeyStr);
        const pemHeader = '-----BEGIN PUBLIC KEY-----';
        const pemFooter = '-----END PUBLIC KEY-----';
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length - 1);
        if (!window.atob) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.atob` is undefined');
        }
        const binaryDerString = window.atob(pemContents);
        const binaryDer = str2ab(binaryDerString);
        try {
            const publicKey = await this.webCrypto.subtle.importKey(
                'spki',
                binaryDer,
                {
                    name: 'RSA-OAEP',
                    hash: 'SHA-256',
                },
                true,
                ['encrypt']
            );
            publicKey.oncomplete = (e) => {};
            const encryptedKey = await this.webCrypto.subtle.encrypt(
                {
                    name: 'RSA-OAEP',
                },
                publicKey,
                secretKey
            );

            const strEncryptedKey = window.btoa(ab2str(encryptedKey));
            return strEncryptedKey;
        } catch (err) {
            console.log(err);
        }
    };
}
class AES {
    constructor() {
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;

        if (!webCrypto) {
            /* eslint-disable*/
            this.Crypto = require('client-crypto');
            /* eslint-enable */
        } else {
            this.webCrypto = webCrypto;
        }
    }

    webCrypto: any;

    Crypto: any;

    private _key: string;

    createKey = async () => {
        if (!this.webCrypto) {
            return window.btoa(this.Crypto.AES.createKey(16));
        }
        try {
            const key: CryptoKey = await this.webCrypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 128,
                },
                true,
                ['encrypt', 'decrypt']
            );
            const arrBufferSecretKey = await this.exportCryptoKey(key);
            const secretKeyStr = window.btoa(ab2str(arrBufferSecretKey));
            this._key = secretKeyStr;
            return secretKeyStr;
        } catch (err) {
            console.log(err);
        }
    };

    /** 设置秘钥 */
    setKey = (secretKey: string) => {
        if (!this.webCrypto) {
            this.Crypto.AES.setKey(window.atob(secretKey));
        }
        this._key = secretKey;
    };

    clearKey = () => {
        if (!this.webCrypto) {
            this.Crypto.AES.clearKey();
        }
        this._key = undefined;
    };

    encrypt = async (data, rawKey?) => {
        if (!rawKey) {
            rawKey = this._key;
        }
        if (!this.webCrypto) {
            return this.Crypto.AES.encrypt(data);
        }

        const iv = this.webCrypto.getRandomValues(new Uint8Array(12));
        const arrBufferKey = str2ab(window.atob(rawKey));
        const secretKey = await this.webCrypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
            'encrypt',
            'decrypt',
        ]);
        const enc = new TextEncoder();
        const newData = enc.encode(JSON.stringify(data));
        try {
            const ciphertext = await this.webCrypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv,
                    tagLength: 128,
                },
                secretKey,
                newData
            );

            const strIv = ab2str(iv);
            const strCiphertext = ab2str(ciphertext);

            return window.btoa(`${strIv}${strCiphertext}`);
        } catch (err) {
            console.log(err);
        }
    };

    decrypt = async (ciphertext, rawKey?) => {
        if (!rawKey) {
            rawKey = this._key;
        }
        if (!this.webCrypto) {
            return this.Crypto.AES.decrypt(ciphertext);
        }

        ciphertext = window.atob(ciphertext);
        const strIv = ciphertext.slice(0, 12);
        const strCiphertext = ciphertext.slice(12);
        const iv = str2ab(strIv);
        const newCiphertext = str2ab(strCiphertext);
        const arrBufferKey = str2ab(window.atob(rawKey));
        try {
            const secretKey = await this.webCrypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
                'encrypt',
                'decrypt',
            ]);
            const data = await this.webCrypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv,
                },
                secretKey,
                newCiphertext
            );
            return JSON.parse(new TextDecoder().decode(data));
        } catch (err) {
            console.log(err);
        }
    };

    exportCryptoKey = async (key) => {
        try {
            const exported = await this.webCrypto.subtle.exportKey('raw', key);
            return exported;
        } catch (err) {
            console.log(err);
        }
    };
}

const Crypto = {
    RSA: new RSA(),
    AES: new AES(),
};

export default Crypto;
