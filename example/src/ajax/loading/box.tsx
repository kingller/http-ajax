import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';
import { BoxProps } from '../../interface';

export default class Box extends React.PureComponent<BoxProps> {
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
