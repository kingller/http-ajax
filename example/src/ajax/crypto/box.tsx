import React from 'react';
import { CodeBox, IBoxProps } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent<IBoxProps> {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>请求加密解密</a>
                </div>
                <div>
                    <ul>
                        <li>发送请求加密解密。</li>
                        <li>
                            需加密请求请在ajax options中添加<code>encrypt</code>设置加密字段。
                        </li>
                        <li>需解密请求服务端会在响应头返回加密字段，ajax会自动根据该加密字段解密。</li>
                        <li>启用加解密需添加</li>
                        <li>
                            <code>import cryptoExtend from &apos;http-ajax/dist/crypto-extend&apos;;</code>
                        </li>
                        <li>
                            <code>ajax.extend(cryptoExtend());</code> （注意：保证该代码只执行一次）。
                        </li>
                        <li>如果启用签名，该扩展必须添加在签名扩展之前。</li>
                    </ul>
                </div>
            </CodeBox>
        );
    }
}
