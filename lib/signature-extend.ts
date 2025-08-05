import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { METHODS } from './interface';
import type { IAjax, IProcessParamsAfterOptions, IParams, IMethod, IOptions } from './interface';
import { isFormData } from './utils/form';
import SHA256 from './utils/sha256';
import getNonce from './utils/nonce';
import signFile from './utils/sign-file';
import './polyfill/form-data';

/**
 * 签名扩展。
 * 将会在请求头中添加字段 sign，timestamp，app-nonce。
 * sign：签名文本；
 * timestamp（签名参数）：UTC 时间（用于校验是否已过期）；
 * app-nonce（签名参数）：只使用一次标识码（用于校验是否已发送过，存入 redis 几分钟后过期）。
 */
function snExtend(): () => void {
    return function sn(): void {
        const { processParamsAfter } = this as IAjax;

        const getKey = (splits: string[]): string => {
            const keyStr = splits.join('');
            return atob(keyStr);
        };

        // 参数混淆，增加签名方式代码被分析出难度
        // app-nonce 只使用一次标识码
        const appNonceField = getKey(['YX', 'Bw', 'LW', '5v', 'bm', 'Nl']);
        // timestamp 时间
        const timestampField = getKey(['dGl', 'tZX', 'N0Y', 'W1w']);
        // sign 签名
        const signField = getKey(['c2l', 'nbg', '=', '=']);
        // file-sum 文件签名
        const fileSumField = getKey(['Zml', 'sZS', '1zd', 'W0', '=']);

        // 校验该扩展是否已添加过
        if (this._snExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `snExtend` can only be added to ajax once!');
        }

        // 添加标志符用来校验该扩展是否已添加
        this._snExtendAdded = true;

        const signData = async ({
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
        }): Promise<void> => {
            let toSnStr = '';
            let fileSum = '';
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
                    toSnStr = queryParams;
                }
            } else {
                if (requestBody && typeof requestBody === 'string') {
                    toSnStr = requestBody;
                } else {
                    const formData: string[] = [];
                    if (isFormData(requestBody)) {
                        const formDataEntries: [key: string, value: string | File][] = [];
                        (requestBody as FormData).forEach(async (value: FormDataEntryValue, key: string) => {
                            formDataEntries.push([key, value]);
                        });
                        // isSignFile
                        const isSignFileField = getKey(['aXNT', 'aWdu', 'Rm', 'ls', 'ZQ', '=', '=']);
                        for await (const [key, value] of formDataEntries) {
                            if (value instanceof File) {
                                if (!options[isSignFileField] || options[isSignFileField](value)) {
                                    const fileHash = await signFile(value);
                                    formData.push(`${key}=${fileHash},${value.size}`);
                                }
                            } else {
                                formData.push(`${key}=${value}`);
                            }
                        }
                        formData.sort();
                        toSnStr = formData.join('&');
                        fileSum = SHA256(toSnStr);
                        toSnStr = fileSum;
                    }
                }
            }

            const timestamp = new Date().getTime();
            const appNonce = uuid();

            const headers: {
                [key: string]: string | number;
            } = {
                [signField]: SHA256(`${toSnStr}${timestamp}${getNonce(appNonce)}`),
                [timestampField]: timestamp,
                [appNonceField]: appNonce,
            };

            if (fileSum) {
                headers[fileSumField] = fileSum;
            }

            _.merge(options, {
                headers,
            });
        };

        (this as IAjax).processParamsAfter = async (props: IProcessParamsAfterOptions): Promise<void> => {
            await processParamsAfter(props);
            const { params, paramsInOptions, method, options, processData } = props;
            await signData({ params, paramsInOptions, method, options, processData });
        };
    };
}

export default snExtend;
