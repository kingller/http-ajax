import _ from 'lodash';

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

const loadScript = (src: string, global?: string): Promise<any> => {
    return new Promise((resolve, reject): void => {
        let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
        if (!script) {
            script = document.createElement('script');
            script.src = src;
            script.onload = (): void => {
                if (global) {
                    resolve(window[global as keyof Window]);
                } else {
                    resolve('');
                }
            };
            script.onerror = reject;
            document.body.appendChild(script);
        } else {
            if (global) {
                resolve(window[global as keyof Window]);
            } else {
                resolve('');
            }
        }
    });
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
            loadScript('https://assets.gaiaworks.cn/static/webcrypto-shim/webcrypto-shim.js');
            loadScript('https://assets.gaiaworks.cn/static/promiz/promiz.js');
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
            loadScript('https://assets.gaiaworks.cn/static/webcrypto-shim/webcrypto-shim.js');
            loadScript('https://assets.gaiaworks.cn/static/promiz/promiz.js');
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
        const newData = await this.textEncode(data);
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
        return JSON.parse(await this.textDecode(data));
    };

    exportCryptoKey = async (key) => {
        let exported = await this.webCrypto.subtle.exportKey('raw', key);
        exported = exported.result || exported;
        return exported;
    };

    textEncode = async (str) => {
        if (window.TextEncoder) {
            const enc = new TextEncoder();
            return enc.encode(JSON.stringify(str));
        }

        const utf8 = unescape(encodeURIComponent(JSON.stringify(str)));
        const result = new Uint8Array(utf8.length);
        for (let i = 0; i < utf8.length; i++) {
            result[i] = utf8.charCodeAt(i);
        }
        return result;
    };

    textDecode = async (buf) => {
        if (window.TextDecoder) {
            return new TextDecoder().decode(buf);
        }
        const TextEncoding = await loadScript(
            'https://assets.gaiaworks.cn/static/text-encoding/dist/dist.js',
            'TextEncoding'
        );
        return new TextEncoding.TextDecoder().decode(buf);
    };
}

const Crypto = {
    RSA: new RSA(),
    AES: new AES(),
};

export default Crypto;
