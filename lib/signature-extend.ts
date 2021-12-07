import _ from 'lodash';
import uuid from 'uuid/v4';
import { isFormData } from './utils/form';
import { IAjax, IAjaxProcessDataAfterOptions, IParams, IMethod, IOptions } from './interface';
import { loadScript } from './utils/load-script';

/**
 * 签名扩展。
 * 将会在请求头中添加字段sign，timestamp，app-nonce。
 * sign：签名文本；
 * timestamp（签名参数）：UTC时间（用于校验是否已过期）；
 * app-nonce（签名参数）：只使用一次标识码（用于校验是否已发送过，存入redis几分钟后过期）。
 */
function signatureExtend(): () => void {
    return function signature(): void {
        const { processDataAfter } = this as IAjax;

        // 参数混淆，增加签名方式代码被分析出难度
        // app-nonce 只使用一次标识码
        const appNonceField = ['app', ['non', 'ce'].join('')].join('-');
        // timestamp 时间
        const timestampField = ['time', 'sta', 'mp'].join('');
        // sign 签名
        const signField = ['si', 'gn'].join('');

        // 校验该扩展是否已添加过
        if (this._signatureExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `signatureExtend` can only be added to ajax once!');
        }

        // 添加标志符用来校验该扩展是否已添加
        this._signatureExtendAdded = true;

        const signData = async ({
            params,
            method,
            options,
            processData,
        }: {
            params: IParams;
            method: IMethod;
            options: IOptions;
            processData?: boolean;
        }): Promise<void> => {
            const signatureStr =
                isFormData(params) || processData === false
                    ? ''
                    : (this as IAjax).stringifyParams(params, method, { cache: true, encodeValue: false });

            const timestamp = new Date().getTime();
            const appNonce = uuid();
            const webCrypto =
                window.crypto ||
                (window as any).webkitCrypto ||
                (window as any).mozCrypto ||
                (window as any).oCrypto ||
                (window as any).msCrypto;

            if (!webCrypto) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                console && console.error('`window.crypto` is undefined');
            }
            const str = `${signatureStr}${timestamp}${appNonce.substring(2, appNonce.length - 1)}`;
            if (!window.TextEncoder) {
                await loadScript('https://assets.gaiaworkforce.com/libs/text-encoding/0.7.0/encoding.js');
            }

            const msgUint8 = new TextEncoder().encode(str);
            const hashBuffer = await webCrypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
            const hashHex = hashArray.map((b) => _.padStart(b.toString(16), 2, '0')).join('');
            _.merge(options, {
                headers: {
                    [signField]: hashHex,
                    [timestampField]: timestamp,
                    [appNonceField]: appNonce,
                },
            });
        };

        (this as IAjax).processDataAfter = async (
            params: IParams,
            props: IAjaxProcessDataAfterOptions
        ): Promise<IParams> => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            params = (await processDataAfter(params, props)) as { [name: string]: any };
            const { method, options, processData } = props;
            await signData({ params, method, options, processData });
            return params;
        };
    };
}

export default signatureExtend;
