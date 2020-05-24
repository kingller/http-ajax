import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import './feedback.less';
import { IClassStyle } from '../../types';

export interface FeedbackProps extends IClassStyle {
    /** 类型 */
    type?: 'success' | 'error' | 'warning' | 'tips';
    /** key值 */
    index?: number;
    /** 子元素 */
    children?: React.ReactNode;
    /** 鼠标移入时的回调 */
    onMouseEnter?: (index: string) => void;
    /** 鼠标离开时的回调 */
    onMouseLeave?: (index: string) => void;
    onClick?: (index: string) => void;
}

export default class Feedback extends React.PureComponent<FeedbackProps> {
    static propTypes = {
        /** 类型 */
        type: PropTypes.oneOf(['success', 'error', 'warning', 'tips']),
        /** key值 */
        index: PropTypes.number,
        /** 自定义类 */
        className: PropTypes.string,
        /** 子元素 */
        children: PropTypes.node,
        /** 鼠标移入时的回调 */
        onMouseEnter: PropTypes.func,
        /** 鼠标离开时的回调 */
        onMouseLeave: PropTypes.func,
        onClick: PropTypes.func,
    };
    static defaultProps = {
        type: 'error',
        className: '',
    };

    static icons = {
        success: 'icon-tick-thin',
        error: 'icon-cross-thin',
        warning: 'icon-warning-circle-o',
        tips: 'icon-tip-circle-o',
    };

    closeFeedback = (e: React.MouseEvent): void => {
        this.props.onClick((e.target as HTMLElement).getAttribute('data-key'));
    };

    mouseEnter = (e: React.MouseEvent): void => {
        const index =
            (e.target as HTMLElement).parentElement.getAttribute('data-key') ||
            (e.target as HTMLElement).getAttribute('data-key');
        this.props.onMouseEnter(index);
    };
    mouseLeave = (e: React.MouseEvent): void => {
        const index =
            (e.target as HTMLElement).parentElement.getAttribute('data-key') ||
            (e.target as HTMLElement).getAttribute('data-key');
        this.props.onMouseLeave(index);
    };

    render(): React.ReactNode {
        const { type, index, className, children, onMouseEnter, onMouseLeave, onClick, ...props } = this.props;
        const clazz = classnames('hr1-feedback', this.props.className);
        return (
            <div
                className={clazz}
                {...props}
                data-type={type}
                data-key={this.props.index}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}>
                <div className="left-icon">
                    <span className={Feedback.icons[type]} />
                </div>
                <div className="right-icon">
                    <Choose>
                        <When condition={typeof children === 'string'}>
                            <div dangerouslySetInnerHTML={{ __html: children as string }} />
                        </When>
                        <Otherwise>
                            <div>{children}</div>
                        </Otherwise>
                    </Choose>
                    <span data-key={this.props.index} className="close icon-cross" onClick={this.closeFeedback} />
                </div>
            </div>
        );
    }
}
