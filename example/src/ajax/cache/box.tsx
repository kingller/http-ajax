import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>Ajax Cache</a>
                </div>
                <div>
                    <p>通过传入参数cache，实现缓存。</p>
                </div>
            </CodeBox>
        );
    }
}
