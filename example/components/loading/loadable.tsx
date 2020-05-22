import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Loading from './loading';
import { ILoading } from './interface';
import { IClassStyle } from '../../types';

export interface LoadableProps extends IClassStyle {
    name?: string;
    /** loading 图标层级 */
    zIndex?: number;
    /** 描述文本 */
    tip?: React.ReactNode;
}

class Loadable extends React.PureComponent<LoadableProps> {
    constructor(props: LoadableProps) {
        super(props);

        const { name } = props;
        if (!name) return;
        // @ts-ignore
        window[name] = this;
    }
    static propTypes = {
        name: PropTypes.string,
        /** loading 图标层级 */
        zIndex: PropTypes.number,
        /** 自定义类名 */
        className: PropTypes.string,
    };

    static childContextTypes = {
        loading: PropTypes.object,
    };

    //未启动的loading个数
    notStartLoadingCount = 0;

    getChildContext(): { loading: ILoading } {
        return {
            loading: {
                start: this.start,
                finish: this.finish,
                count: this.count,
                name: this.props.name,
                getLoading: this.getLoading,
            },
        };
    }

    componentDidMount(): void {
        if (this.notStartLoadingCount > 0) {
            this.loadingCom.start(this.notStartLoadingCount);
            this.notStartLoadingCount = 0;
        }
    }

    componentWillUnmount(): void {
        const { name } = this.props;
        if (!name) return;
        // @ts-ignore
        delete window[name];
    }

    loadingCom: Loading = undefined;
    saveLoading = (node: Loading): void => {
        this.loadingCom = node;
    };

    /** 开始加载 */
    start = (): void => {
        if (!this.loadingCom) {
            this.notStartLoadingCount++;
            return;
        }
        this.loadingCom.start();
    };

    /**
     * 结束加载
     * @num 可以不传；如果传入num，则必须为正整数
     */
    finish = (num?: number): void => {
        if (typeof num !== 'undefined' && num !== null && typeof num !== 'number') {
            console.error('loading.finish(num) must pass in an integer!');
            return;
        }
        if (typeof num === 'number' && num <= 0) {
            console.error('loading.finish(num) must pass in an positive integer!');
            return;
        }
        if (!num) {
            num = 1;
        }
        const finishStartedNum = num - this.notStartLoadingCount;
        if (finishStartedNum <= 0) {
            this.notStartLoadingCount -= num;
            return;
        }
        this.notStartLoadingCount = 0;
        this.loadingCom && this.loadingCom.finish(finishStartedNum);
    };

    /** 结束所有加载 */
    clear = (): void => {
        this.notStartLoadingCount = 0;
        this.loadingCom && this.loadingCom.clear();
    };

    count = (): number => {
        return (this.loadingCom ? this.loadingCom.count : 0) + this.notStartLoadingCount;
    };

    getLoading = (): Loading => {
        return this.loadingCom;
    };

    render(): React.ReactNode {
        const { zIndex, className, tip, ...props } = this.props;
        return (
            <div className={classnames('pdr-pos-r', className)}>
                <div {...props} />
                <Loading zIndex={zIndex} tip={tip} ref={this.saveLoading} />
            </div>
        );
    }
}

export default Loadable;
