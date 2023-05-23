import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>发送 options 中有参数的请求</a>
                </div>
                <div>
                    <ul>
                        <li>url 支持包含参数</li>
                        <li>
                            参数从<code>options.params</code>写入，发送请求时拼接到 url 上。
                        </li>
                    </ul>
                </div>
            </CodeBox>
        );
    }
}
