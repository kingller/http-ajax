import React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { IArrayLike } from '../../types';

import store from './store';

interface DemoPageProps {
    className?: string;
}

@observer
export default class DemoPage extends React.Component<DemoPageProps> {
    constructor(...args: IArrayLike) {
        // @ts-ignore
        super(...args);
    }

    getDefaultClassName = function (): string {
        const hash = window.location.hash.split('?')[0];
        const matchs = hash.match(/[^\/]+$/);
        if (matchs) {
            return decodeURI(matchs[0]) + '-example-page';
        }
        return '';
    };

    render(): React.ReactNode {
        let { className, children } = this.props;
        if (!children) return null;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children = Array.from(children as React.ReactNode[]);
        const lastChildren = (children as React.ReactNode[]).pop();

        return (
            <div className={classnames(this.getDefaultClassName(), className)}>
                <section className="markdown">
                    {children}
                    <h2 data-scrollama-index="1" className="code-box-expand-trigger-container">
                        <span>代码演示</span>
                        <i
                            className={classnames(
                                'icon icon-rect code-box-expand-trigger',
                                (store.codeExpand && 'active') || ''
                            )}
                            title="展开全部代码"
                            onClick={store.changeCodeExpand}
                        />
                    </h2>
                </section>
                {lastChildren}
            </div>
        );
    }
}
