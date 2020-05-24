import React from 'react';
import { CodeBox, IBoxProps } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent<IBoxProps> {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>请求失败自动提示</a>
                </div>
                <div>
                    <p>
                        请求失败返回 <code>result: false</code> 时，会自动调用{' '}
                        <code>window.$feedback(response.errorMsg)</code> 显示错误信息提示
                    </p>
                </div>
            </CodeBox>
        );
    }
}
