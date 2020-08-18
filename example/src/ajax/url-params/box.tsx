import React from 'react';
import { CodeBox } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>发送url中有参数的请求</a>
                </div>
                <div>
                    <ul>
                        <li>url支持包含参数</li>
                        <li>
                            示例： <code>example/:params</code>
                        </li>
                        <li>
                            <code>:params</code> 代表参数（以 <code>:</code> 开头），参数名为 <code>params</code>{' '}
                            ，将会从传入的ajax参数中获取
                        </li>
                    </ul>
                </div>
            </CodeBox>
        );
    }
}
