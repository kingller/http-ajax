import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>流式响应</a>
                </div>
                <div>
                    <p>
                        示例：在请求发起后，服务器不会一次性返回完整数据，而是逐步推送内容，模拟 AI 大模型的流式输出效果
                    </p>
                </div>
            </CodeBox>
        );
    }
}
