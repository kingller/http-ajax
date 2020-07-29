import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>分段返回响应</a>
                </div>
                <div>
                    <p>示例：一个请求，服务器段每隔一秒返回一个数字，10秒后完成。</p>
                    <section className="markdown">
                        <div className="big-pipe-demo-ins">
                            <ul>
                                <li>分段返回</li>
                                <li>
                                    <code>{`<chunk>数据</chunk>`}</code>
                                </li>
                                <li>
                                    分段返回数据需以 <code>{`<chunk></chunk>`}</code> 围绕
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </CodeBox>
        );
    }
}
