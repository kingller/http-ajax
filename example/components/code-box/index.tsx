import React from 'react';
import PubSub from 'pubsub-js';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { IArrayLike } from '../../types';

import SourceCode from './source-code';
import demoPageStore from '../demo-page/store';

interface CodeBoxProps {
    /** 示例 */
    demo: React.ReactNode;
    /** id */
    id?: string;
    /** 类名 */
    className?: string;
    /** 示例代码 */
    sourceCode?: string | IArrayLike;
    /** 标题 */
    title?: string;
    /** 描述 */
    description?: React.ReactNode;
}

interface CodeBoxStates {
    codeExpand: boolean;
}

@observer
export default class CodeBox extends React.Component<CodeBoxProps, CodeBoxStates> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    codeExpandPubSubId: any;
    constructor(...args: IArrayLike) {
        // @ts-ignore
        super(...args);
        this.state = {
            codeExpand: undefined,
        };
        this.codeExpandPubSubId = PubSub.subscribe('pandora.example.code.expand.changed', (): void => {
            this.setState({ codeExpand: undefined });
        });
    }

    componentWillUnmount(): void {
        PubSub.unsubscribe(this.codeExpandPubSubId);
    }

    handleCodeExpand = (): void => {
        this.setState({ codeExpand: !this.getCodeExpand() });
    };

    getCodeExpand = (): boolean => {
        let { codeExpand } = this.state;
        if (codeExpand === undefined) {
            codeExpand = demoPageStore.codeExpand;
        }
        return codeExpand;
    };

    onCopied = (): void => {
        window.$feedback('Copied', 'success');
    };

    render(): React.ReactNode {
        const { className, demo, sourceCode, title, description, children, ...props } = this.props;
        const codeExpand = this.getCodeExpand();

        return (
            <section className={classnames('code-box-container', className)} {...props}>
                <div className="code-box">
                    <div className="code-box-demo">{demo}</div>
                    <div className="code-box-meta markdown">
                        <If condition={!!title}>
                            <div className="code-box-title">
                                <a>{title}</a>
                            </div>
                        </If>
                        <If condition={!!description}>
                            <div>{description}</div>
                        </If>
                        {children}
                        <If condition={!!sourceCode}>
                            <span
                                className={classnames(
                                    'code-expand-icon icon',
                                    (codeExpand && 'icon-shrink') || 'icon-spread'
                                )}
                                onClick={this.handleCodeExpand}
                            />
                        </If>
                    </div>
                    <If condition={!!sourceCode}>
                        <div
                            className={classnames(
                                'highlight-wrapper',
                                (codeExpand && 'highlight-wrapper-expand') || ''
                            )}>
                            <div className="highlight">
                                <div className="code-box-actions">
                                    <CopyToClipboard
                                        text={Array.isArray(sourceCode) ? sourceCode.join('\n') : sourceCode}
                                        onCopy={this.onCopied}>
                                        <i className="icon icon-copy code-box-code-copy" />
                                    </CopyToClipboard>
                                </div>
                                <SourceCode value={sourceCode} />
                            </div>
                        </div>
                    </If>
                </div>
            </section>
        );
    }
}
