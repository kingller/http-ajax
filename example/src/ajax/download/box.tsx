import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>Ajax json</a>
                </div>
                <div>
                    <p>下载文件时，返回文件格式是html/text，需要将json设置为false</p>
                </div>
            </CodeBox>
        );
    }
}
