import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import _ from 'lodash';

import { IClassStyle } from '../../types';

import './index.less';

export type ButtonProps = {
    /** 设置按钮类型 */
    type?: 'default' | 'primary' | 'danger' | 'important' | 'icon';
    btnType?: 'button' | 'reset' | 'submit';
    /** 图标 */
    icon?: string;
    /** 如果有href属性，则渲染成按钮形状的链接a标签 */
    href?: string;
    /** 相当于 a 链接的 target 属性，href 存在时生效 */
    target?: string;
    /** click 事件的 handler */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void | Promise<any>;
    /** 提示文本 */
    title?: string;
    /** 按钮失效状态 */
    disabled?: boolean;
    /** 当鼠标不能操作时显示该提示信息 */
    disabledTitle?: string;
    /** 幽灵属性，使按钮背景透明 */
    ghost?: boolean;
    link?: boolean;
    tabIndex?: number;
    children?: React.ReactNode;
} & IClassStyle;

interface ButtonState {
    disabled: boolean;
}

export class Button extends React.PureComponent<ButtonProps, ButtonState> {
    static defaultProps = {
        className: '',
        type: 'default' as 'default',
        btnType: 'button' as 'button',
        icon: '',
        onClick: _.noop,
        title: '',
        disabled: false,
        ghost: false,
        link: false,
    };
    state = {
        disabled: false,
    };

    static displayName = 'Button';

    isUnmounted = false;
    componentWillUnmount(): void {
        this.isUnmounted = true;
    }
    static contextTypes = {
        loading: PropTypes.shape({
            start: PropTypes.func,
            finish: PropTypes.func,
        }),
    };
    loading = {
        start: (): void => {
            if (this.context.loading) {
                this.context.loading.start();
            }
            this.setState({ disabled: true });
        },
        finish: (): void => {
            if (this.context.loading) {
                this.context.loading.finish();
            }
            if (!this.isUnmounted) {
                this.setState({ disabled: false });
            }
        },
    };

    onClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>): void => {
        if (this.state.disabled || this.props.disabled) {
            e.preventDefault();
            return;
        }
        const { onClick } = this.props;
        // prettier-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: Promise<any> | void = onClick(e);
        if (typeof result !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((result as Promise<any>).then) {
                this.loading.start();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (result as Promise<any>).then(this.loading.finish, this.loading.finish);
            }
        }
    };

    render(): React.ReactNode {
        let { type, icon, disabled, disabledTitle, className, children, btnType, ghost, link, ...props } = this.props;

        let Elem;

        disabled = disabled || this.state.disabled;

        if (type === 'icon' || icon) {
            if (type === 'icon') {
                link = true;
                type = 'primary';
            }
            className = classnames('pdr-btn-icon', className);
        }

        className = classnames('pdr-btn', { 'pdr-btn-ghost': ghost, 'pdr-btn-link': link }, type, className);
        if (typeof this.props.href === 'string') {
            Elem = 'a';
            className = classnames(className, { disabled });
        } else {
            Elem = 'button';
            props = Object.assign(props, {
                type: btnType,
                disabled: disabled ? 'disabled' : undefined,
            });
        }
        if (disabled && disabledTitle) {
            props = Object.assign(props, { title: disabledTitle });
        }

        return (
            // @ts-ignore
            <Elem {...props} className={className} onClick={this.onClick}>
                <If condition={!!icon}>
                    <i className={classnames('icon', icon)} />
                </If>
                <If condition={!!children}>
                    <span>{children}</span>
                </If>
            </Elem>
        );
    }
}

export default Button;
