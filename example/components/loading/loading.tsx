import React from 'react';
import _ from 'lodash';

import LoadingInner from './loading-inner';

import './loading.less';

export interface LoadingProps {
    /** 层级 */
    zIndex?: number;
    /** 描述文本 */
    tip?: React.ReactNode;
}

export default class Loading extends React.PureComponent<LoadingProps> {
    count = 0;

    state = {
        count: 0,
    };
    /**
     * 开始加载
     * @num 可以不传
     */
    start = (num?: number): void => {
        const addNum = typeof num === 'number' ? num : 1;
        if (addNum <= 0) {
            return;
        }
        this.count += addNum;
        this.setState({ count: this.count });
    };
    /**
     * 结束加载
     * @num 可以不传
     */
    finish = (num?: number): void => {
        const finishNum = typeof num === 'number' ? num : 1;
        if (finishNum <= 0) {
            return;
        }
        this.count = Math.max(this.count - finishNum, 0);
        this.setState({ count: this.count });
    };
    /** 结束所有加载 */
    clear = (): void => {
        this.count = 0;
        this.setState({ count: this.count });
    };
    render(): React.ReactNode {
        if (this.state.count <= 0) return null;
        const { zIndex, tip } = this.props;
        const style = _.isNumber(zIndex) ? { zIndex } : undefined;
        return (
            <div className="pdr-modal pdr-loading" style={style}>
                <LoadingInner tip={tip} />
            </div>
        );
    }
}
