import _ from 'lodash';
import Crypto from 'client-crypto';
import { v4 as uuid } from 'uuid';
import { METHODS } from './interface';
import type {
    IAjax,
    IProcessParamsAfterOptions,
    IProcessParamsAfterResult,
    IParams,
    IMethod,
    IOptions,
} from './interface';

/**
 * 签名扩展。
 * 将会在请求头中添加字段 sign，timestamp，app-nonce。
 * sign：签名文本；
 * timestamp（签名参数）：UTC 时间（用于校验是否已过期）；
 * app-nonce（签名参数）：只使用一次标识码（用于校验是否已发送过，存入 redis 几分钟后过期）。
 */
function signatureExtend(): () => void {
    return function signature(): void {
        const { processParamsAfter } = this as IAjax;

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

        const signData = ({
            params,
            paramsInOptions,
            method,
            options,
            processData,
        }: {
            params: IParams;
            paramsInOptions: IOptions['params'] | string;
            method: IMethod;
            options: IOptions;
            processData?: boolean;
        }): void => {
            let signatureStr = '';
            const { requestBody, queryParams } = (this as IAjax).stringifyParams({
                params,
                paramsInOptions,
                method,
                cache: true,
                encodeValue: false,
                processData,
            });
            if (method === METHODS.get) {
                if (queryParams) {
                    signatureStr = queryParams;
                }
            } else {
                if (requestBody && typeof requestBody === 'string') {
                    signatureStr = requestBody;
                }
            }

            const timestamp = new Date().getTime();
            const appNonce = uuid();
            const end = appNonce.length - 1;

            _.merge(options, {
                headers: {
                    [signField]: Crypto.SHA256(`${signatureStr}${timestamp}${appNonce.substring(2, end)}`),
                    [timestampField]: timestamp,
                    [appNonceField]: appNonce,
                },
            });
        };

        (this as IAjax).processParamsAfter = (props: IProcessParamsAfterOptions): IProcessParamsAfterResult => {
            const { params, paramsInOptions } = processParamsAfter(props);
            const { method, options, processData } = props;
            signData({ params, paramsInOptions, method, options, processData });
            return { params, paramsInOptions };
        };
    };
}

export default signatureExtend;
