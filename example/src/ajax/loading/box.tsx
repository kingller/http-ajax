import React from 'react';
import { CodeBox, IBoxProps } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent<IBoxProps> {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>Ajax Loading</a>
                </div>
                <div>
                    <p>启用loading</p>
                </div>
            </CodeBox>
        );
    }
}
