import React from 'react';
import { IArrayLike, ISizeProps, IButtonType } from '../../types';

export type DropdownButtonBaseProps = {
    /** 主按钮是否禁用 */
    disabled?: boolean | (() => boolean);
    /** 按钮类型，和 Button 一致 */
    type?: IButtonType;
    /** 图标 */
    icon?: string;
    actions?: IArrayLike;
    /** 提示文本 */
    title?: string;
    name?: string;
    /** 菜单项被选中的 handler */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSelect?: (action?: object) => any;
    /** 控制dropdownButton的显示与隐藏 */
    visible?: boolean | (() => boolean);
    /** 页面 render 后的回调 */
    renderCallback?: () => void;
    /** 是否将弹出窗脱离父组件 */
    tetherable?: boolean;
    prefixCls?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dropdownChildren?: React.ReactNode | ((options?: IArrayLike, props?: object) => any[] | null);
    children?: React.ReactNode;
    ghost?: boolean;
    link?: boolean;
} & ISizeProps;
