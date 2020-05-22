import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>签名</a>
                </div>
                <div>
                    <ul>
                        <li>发送请求并签名。</li>
                        <li>
                            启用签名需添加 <code>ajax.extend(ajax.signatureExtend())</code>{' '}
                            （注意：保证该代码只执行一次）。
                        </li>
                        <li>如果启用加密，该扩展必须添加在加密扩展之后。</li>
                    </ul>
                </div>
            </CodeBox>
        );
    }
}
