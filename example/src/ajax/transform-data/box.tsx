import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>自定义响应体</a>
                </div>
                <div>
                    <p>通过传入参数transformResponse，实现自定义响应体。</p>
                </div>
            </CodeBox>
        );
    }
}
