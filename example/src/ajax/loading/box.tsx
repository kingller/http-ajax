import React from 'react';
import highlight from 'highlight.js';
import { CodeBox, IBoxProps } from '../../../components';
import Demo from './code';
import sourceCode from '!raw-loader!./code';

export default class Box extends React.PureComponent<IBoxProps> {
    componentDidMount() {
        Array.from(document.querySelector('.ajax-loading').querySelectorAll<HTMLElement>('pre code')).map(
            function (block) {
                highlight.highlightBlock(block);
            }
        );
    }

    render(): React.ReactNode {
        return (
            <CodeBox {...this.props} demo={<Demo />} sourceCode={sourceCode}>
                <div className="code-box-title">
                    <a>Ajax Loading</a>
                </div>
                <div>
                    <ul>
                        <li>启用loading</li>
                        <li>需先添加 loading 扩展</li>
                        <li>
                            <pre>
                                <code>
                                    {`import loadingExtend from 'http-ajax/dist/loading-extend';
ajax.extend(loadingExtend());`}
                                </code>
                            </pre>
                        </li>
                        <li>需要自定义显示/隐藏 loading 时， loadingExtend 传入控制函数即可</li>
                        <li>
                            <pre>
                                <code>
                                    {`ajax.extend(loadingExtend({
    getLoading: ({ loadingName: string | symbol }) => {
        start: () => {
            // 添加显示loading逻辑
            console.log('start loading');
        },
        finish: () => {
            // 添加隐藏loading逻辑
            console.log('end loading');
        },
    }
}));`}
                                </code>
                            </pre>
                        </li>
                        <li>注意：保证该扩展只添加一次</li>
                    </ul>
                </div>
            </CodeBox>
        );
    }
}
