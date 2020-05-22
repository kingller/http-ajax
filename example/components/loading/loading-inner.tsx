import React from 'react';
import classnames from 'classnames';

import { IClassStyle } from '../../types';

import '../../css/common.less';

interface LoadingInnerProps extends IClassStyle {
    /** 描述文本 */
    tip?: React.ReactNode;
}

export default class LoadingInner extends React.PureComponent<LoadingInnerProps> {
    static defaultProps: Partial<LoadingInnerProps> = {
        className: '',
        style: undefined,
    };

    render(): React.ReactNode {
        const { className, style, tip } = this.props;
        return (
            <div className={classnames('pdr-loading-inner', 'loader-inner', 'ball-beat', className)} style={style}>
                <div className="pdr-theme-bg" />
                <div className="pdr-theme-bg" />
                <div className="pdr-theme-bg" />
                <div className="pdr-loading-text">{tip}</div>
            </div>
        );
    }
}
