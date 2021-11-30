import _ from 'lodash';
import Crypto from 'client-crypto';

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
    encrypt = async (secretKeyStr, pem) => {
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;
        if (!webCrypto) {
            return Crypto.RSA.encrypt(secretKeyStr, pem);
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
        const publicKey = await webCrypto.subtle.importKey(
            'spki',
            binaryDer,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            true,
            ['encrypt']
        );

        const encryptedKey = await webCrypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            publicKey,
            secretKey
        );

        const strEncryptedKey = window.btoa(ab2str(encryptedKey));
        return strEncryptedKey;
    };
}
class AES {
    private _key: string;

    createKey = async () => {
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;
        if (!webCrypto) {
            return window.btoa(Crypto.AES.createKey(16));
        }
        const key: CryptoKey = await webCrypto.subtle.generateKey(
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
    };

    /** 设置秘钥 */
    setKey = (secretKey: string) => {
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;
        if (!webCrypto) {
            Crypto.AES.setKey(window.atob(secretKey));
        }
        this._key = secretKey;
    };

    clearKey = () => {
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;
        if (!webCrypto) {
            Crypto.AES.clearKey();
        }
        this._key = undefined;
    };

    encrypt = async (data, rawKey?) => {
        if (!rawKey) {
            rawKey = this._key;
        }
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;
        if (!webCrypto) {
            return Crypto.AES.encrypt(data);
        }

        const iv = webCrypto.getRandomValues(new Uint8Array(12));
        const arrBufferKey = str2ab(window.atob(rawKey));
        const secretKey = await webCrypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
            'encrypt',
            'decrypt',
        ]);
        const enc = new TextEncoder();
        const newData = enc.encode(JSON.stringify(data));

        const ciphertext = await webCrypto.subtle.encrypt(
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
    };

    decrypt = async (ciphertext, rawKey?) => {
        if (!rawKey) {
            rawKey = this._key;
        }
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;
        if (!webCrypto) {
            return Crypto.AES.decrypt(ciphertext);
        }

        ciphertext = window.atob(ciphertext);
        const strIv = ciphertext.slice(0, 12);
        const strCiphertext = ciphertext.slice(12);
        const iv = str2ab(strIv);
        const newCiphertext = str2ab(strCiphertext);
        const arrBufferKey = str2ab(window.atob(rawKey));
        const secretKey = await webCrypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
            'encrypt',
            'decrypt',
        ]);
        const data = await webCrypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv,
            },
            secretKey,
            newCiphertext
        );
        return JSON.parse(new TextDecoder().decode(data));
    };

    exportCryptoKey = async (key) => {
        const webCrypto =
            window.crypto ||
            (window as any).webkitCrypto ||
            (window as any).mozCrypto ||
            (window as any).oCrypto ||
            (window as any).msCrypto;
        const exported = await webCrypto.subtle.exportKey('raw', key);
        return exported;
    };
}

const webCrypto = {
    RSA: new RSA(),
    AES: new AES(),
};

export default webCrypto;
