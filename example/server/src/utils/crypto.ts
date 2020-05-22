import AES from 'pandora-aes';
import * as _ from 'lodash';

function encryptOrDecryptDataArrayField(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { [name: string]: any } | any[],
    secretKey: string,
    fieldPaths: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encryptOrDecryptFuc: (data: any, secretKey: string) => any
): void {
    let currentData = data;
    for (let index = 0; index < fieldPaths.length; index++) {
        if (!currentData || typeof currentData !== 'object') {
            break;
        }
        const fieldName = fieldPaths[index];
        if (!fieldName) {
            continue;
        }
        if (fieldName === '${index}') {
            if (!Array.isArray(currentData)) {
                break;
            }
        }
        if (index === fieldPaths.length - 1) {
            if (fieldName === '${index}') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (currentData as any[]).forEach((v, i) => {
                    if (typeof v !== 'undefined') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (currentData as any[])[i] = encryptOrDecryptFuc(v, secretKey);
                    }
                });
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const value = (currentData as { [name: string]: any })[fieldName];
                if (typeof value !== 'undefined') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (currentData as { [name: string]: any })[fieldName] = encryptOrDecryptFuc(value, secretKey);
                }
            }
            return;
        }
        if (fieldName === '${index}') {
            const restFieldPaths = fieldPaths.slice(index + 1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (currentData as any[]).forEach((d) => {
                encryptOrDecryptDataArrayField(d, secretKey, restFieldPaths, encryptOrDecryptFuc);
            });
            break;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            currentData = (currentData as { [name: string]: any })[fieldName];
        }
    }
}

function encryptOrDecryptDataField(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { [name: string]: any } | any[],
    secretKey: string,
    filed: string,
    type: 'encrypt' | 'decrypt'
): void {
    if (!filed || !data) {
        return;
    }
    const encryptOrDecryptFuc = type === 'encrypt' ? AES.encrypt : AES.decrypt;
    if (/\$\{index\}(\.|$)/.test(filed)) {
        // 需要遍历数组加密
        const fieldPaths = filed.split('.');
        encryptOrDecryptDataArrayField(data, secretKey, fieldPaths, encryptOrDecryptFuc);
    } else {
        let value = _.get(data, filed);
        if (typeof value !== 'undefined') {
            value = encryptOrDecryptFuc(value, secretKey);
            _.set(data, filed, value);
        }
    }
}

/** 字段加密 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function encryptDataField(data: { [name: string]: any }, secretKey: string, filed: string): void {
    encryptOrDecryptDataField(data, secretKey, filed, 'encrypt');
}

/** 字段解密 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decryptDataField(data: { [name: string]: any } | any[], secretKey: string, filed: string): void {
    encryptOrDecryptDataField(data, secretKey, filed, 'decrypt');
}

/** 字段加密 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function encryptData(data: { [name: string]: any } | string, secretKey: string, encrypt: 'all' | string[]): any {
    if (encrypt === 'all') {
        return AES.encrypt(data, secretKey);
    } else {
        if (!data || typeof data !== 'object') {
            return data;
        }
        if (Array.isArray(encrypt)) {
            data = _.cloneDeep(data);
            encrypt.forEach((field) => {
                encryptDataField(data as { [name: string]: any }, secretKey, field);
            });
        }
        return data;
    }
}

/** 字段解密 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decryptData(
    data: { [name: string]: any } | any[] | string,
    secretKey: string,
    decrypt: 'all' | string[]
): any {
    if (decrypt === 'all') {
        return AES.decrypt(data as string, secretKey);
    } else {
        if (!data || typeof data !== 'object') {
            return data;
        }
        if (Array.isArray(decrypt)) {
            data = _.cloneDeep(data);
            decrypt.forEach((field) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                decryptDataField(data as { [name: string]: any } | any[], secretKey, field);
            });
        }
        return data;
    }
}
