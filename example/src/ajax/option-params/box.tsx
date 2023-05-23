import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>发送有 query string 的请求</a>
                </div>
                <div>
                    <ul>
                        <li>
                            参数从 <code>options.params</code> 传入，发送请求时拼接到 <code>URL</code> query string 上
                        </li>
                        <li>
                            <code>GET</code> 请求不推荐使用， 推荐使用第二个参数传入。
                        </li>
                    </ul>
                </div>
            </CodeBox>
        );
    }
}
