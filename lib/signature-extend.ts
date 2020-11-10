import _ from 'lodash';
import Crypto from 'client-crypto';
import uuid from 'uuid/v4';
import { isFormData } from './utils/form';
import { IAjax, IAjaxProcessDataOptions, IParams, IMethod, IOptions } from './interface';

/**
 * 签名扩展。
 * 将会在请求头中添加字段sign，timestamp，app-nonce。
 * sign：签名文本；
 * timestamp（签名参数）：UTC时间（用于校验是否已过期）；
 * app-nonce（签名参数）：只使用一次标识码（用于校验是否已发送过，存入redis几分钟后过期）。
 */
function signatureExtend(): () => void {
    return function signature(): void {
        const { processData } = this as IAjax;

        // 参数混淆，增加签名方式代码被分析出难度
        // app-nonce 只使用一次标识码
        const appNonceField = ['app', ['non', 'ce'].join('')].join('-');
        // timestamp 时间
        const timestampField = ['time', 'sta', 'mp'].join('');
        // sign 签名
        const signField = ['si', 'gn'].join('');

        // 校验该扩展是否已添加过
        if (this._signatureExtendAdded) {
            console && console.error('`signatureExtend` can only be added to ajax once!');
        }

        // 添加标志符用来校验该扩展是否已添加
        this._signatureExtendAdded = true;

        const signData = ({
            params,
            method,
            options,
        }: {
            params: IParams;
            method: IMethod;
            options: IOptions;
        }): void => {
            const signatureStr = isFormData(params)
                ? ''
                : (this as IAjax).stringifyParams(params, method, { cache: true, encodeValue: false });

            const timestamp = new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000;
            const appNonce = uuid();

            _.merge(options, {
                headers: {
                    [signField]: Crypto.SHA256(
                        `${signatureStr}${timestamp}${appNonce.substring(2, appNonce.length - 1)}`
                    ),
                    [timestampField]: timestamp,
                    [appNonceField]: appNonce,
                },
            });
        };

        (this as IAjax).processData = (params: IParams, props: IAjaxProcessDataOptions): IParams => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            params = processData(params, props) as { [name: string]: any };
            const { method, options } = props;
            signData({ params, method, options });
            return params;
        };
    };
}

export default signatureExtend;
