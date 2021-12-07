import _ from 'lodash';
import { loadScript } from './load-script';

const str2ab = (str: string) => {
    const buf: ArrayBuffer = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};

const ab2str = (buf: ArrayBuffer) => {
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
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.crypto` is undefined');
        } else {
            this.webCrypto = webCrypto;
        }
        if (navigator.userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)) {
            loadScript('https://assets.gaiaworkforce.com/libs/webcrypto/0.1.7/webcrypto-shim.min.js');
            loadScript('https://assets.gaiaworkforce.com/libs/promiz/1.0.6/promiz.min.js');
        }
        if (!window.TextEncoder) {
            loadScript('https://assets.gaiaworkforce.com/libs/text-encoding/0.7.0/encoding.js');
        }
    }

    webCrypto: any;

    Crypto: any;

    encrypt = async (secretKeyStr, pem) => {
        if (!this.webCrypto) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.crypto` is undefined');
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
        const binaryDerString = window.atob(pemContents.replace(/\s/g, ''));
        const binaryDer = str2ab(binaryDerString);
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

        let encryptedKey = await this.webCrypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            publicKey,
            secretKey
        );
        encryptedKey = encryptedKey.result || encryptedKey;
        const strEncryptedKey = window.btoa(ab2str(encryptedKey));
        return strEncryptedKey;
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
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.crypto` is undefined');
        } else {
            this.webCrypto = webCrypto;
        }
        if (navigator.userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)) {
            loadScript('https://assets.gaiaworkforce.com/libs/webcrypto/0.1.7/webcrypto-shim.min.js');
            loadScript('https://assets.gaiaworkforce.com/libs/promiz/1.0.6/promiz.min.js');
        }
        if (!window.TextEncoder) {
            loadScript('https://assets.gaiaworkforce.com/libs/text-encoding/0.7.0/encoding.js');
        }
    }

    webCrypto: any;

    Crypto: any;

    private _key: string;

    createKey = async () => {
        if (!this.webCrypto) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.crypto` is undefined');
        }
        let key = await this.webCrypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 128,
            },
            true,
            ['encrypt', 'decrypt']
        );
        key = key.result || key;
        const arrBufferSecretKey = await this.exportCryptoKey(key);
        const secretKeyStr = window.btoa(ab2str(arrBufferSecretKey));
        this._key = secretKeyStr;
        return secretKeyStr;
    };

    /** 设置秘钥 */
    setKey = (secretKey: string) => {
        if (!this.webCrypto) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.crypto` is undefined');
        }
        this._key = secretKey;
    };

    clearKey = () => {
        if (!this.webCrypto) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.crypto` is undefined');
        }
        this._key = undefined;
    };

    encrypt = async (data, rawKey?) => {
        if (!rawKey) {
            rawKey = this._key;
        }
        if (!this.webCrypto) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.crypto` is undefined');
        }

        const iv = this.webCrypto.getRandomValues(new Uint8Array(12));
        const arrBufferKey = str2ab(window.atob(rawKey.replace(/\s/g, '')));
        const secretKey = await this.webCrypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
            'encrypt',
            'decrypt',
        ]);
        const newData = new TextEncoder().encode(JSON.stringify(data));
        let ciphertext = await this.webCrypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
                tagLength: 128,
            },
            secretKey,
            newData
        );
        ciphertext = ciphertext.result || ciphertext;
        const strIv = ab2str(iv);
        const strCiphertext = ab2str(ciphertext);

        return window.btoa(`${strIv}${strCiphertext}`);
    };

    decrypt = async (ciphertext, rawKey?) => {
        if (!rawKey) {
            rawKey = this._key;
        }
        if (!this.webCrypto) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('`window.crypto` is undefined');
        }

        ciphertext = window.atob(ciphertext.replace(/\s/g, ''));
        const strIv = ciphertext.slice(0, 12);
        const strCiphertext = ciphertext.slice(12);
        const iv = str2ab(strIv);
        const newCiphertext = str2ab(strCiphertext);
        const arrBufferKey = str2ab(window.atob(rawKey.replace(/\s/g, '')));
        const secretKey = await this.webCrypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
            'encrypt',
            'decrypt',
        ]);

        let data = await this.webCrypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv,
                tagLength: 128,
            },
            secretKey,
            newCiphertext
        );
        data = data.result || data;
        return JSON.parse(new TextDecoder().decode(data));
    };

    exportCryptoKey = async (key) => {
        let exported = await this.webCrypto.subtle.exportKey('raw', key);
        exported = exported.result || exported;
        return exported;
    };
}

const Crypto = {
    RSA: new RSA(),
    AES: new AES(),
};

export default Crypto;
