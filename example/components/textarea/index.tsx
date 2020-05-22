import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import _ from 'lodash';
import autosize from 'autosize';
// @ts-ignore
import getLineHeight from 'line-height';

import './index.less';

import { IClassStyle } from '../../types';

export type TextareaProps = {
    value?: string;
    /** 文本框内容变化时的回调 */
    onChange?: (value: string, e?: React.ChangeEvent<HTMLTextAreaElement>) => void;
    /** 文本框获得焦点时的回调 */
    onFocus?: (e?: React.FocusEvent<HTMLTextAreaElement>) => void;
    /** 设置光标的位置 */
    setCursorPosition?: (textareaEl: HTMLTextAreaElement) => void;
    /** 是否可拖动大小 */
    resizable?: boolean;
    /** 设置行数 */
    rows?: number;
    placeholder?: string;
    /** 是否自适应高度 */
    autoResizable?: boolean;
    /** 设置最大行数 */
    maxRows?: number;
    readOnly?: boolean;
    disabled?: boolean;
} & IClassStyle;

export interface TextareaState {
    currentValue?: string;
    lineHeight?: number;
}

export class Textarea extends React.PureComponent<TextareaProps, TextareaState> {
    static propTypes = {
        value: PropTypes.string,
        /** 文本框内容变化时的回调 */
        onChange: PropTypes.func,
        /** 文本框获得焦点时的回调 */
        onFocus: PropTypes.func,
        /** 设置光标的位置 */
        setCursorPosition: PropTypes.func,
        /** 是否可拖动大小 */
        resizable: PropTypes.bool,
        /** 设置行数 */
        rows: PropTypes.number,
        /** 是否自适应高度 */
        autoResizable: PropTypes.bool,
        /** 设置最大行数 */
        maxRows: PropTypes.number,
        readOnly: PropTypes.bool,
    };
    static defaultProps = {
        onChange: _.noop,
        onFocus: _.noop,
        setCursorPosition: _.noop,
        resizable: false,
        rows: 4,
        autoResizable: false,
        maxRows: 0,
    };

    state = {
        currentValue: '',
        lineHeight: null as number,
    };

    rafHandler: number | undefined;

    componentDidMount(): void {
        const { autoResizable, maxRows } = this.props;
        if (autoResizable) {
            if (typeof maxRows === 'number') {
                this.updateLineHeight();
            }

            if (typeof maxRows === 'number') {
                setTimeout((): Element => autosize(this.textareaEl));
            } else {
                autosize(this.textareaEl);
            }
        }
    }

    componentWillUnmount(): void {
        this.dispatchEvent('autosize:destroy');
    }

    componentDidUpdate(prevProps: TextareaProps): void {
        //设置光标位置
        if (this.props.setCursorPosition) {
            this.props.setCursorPosition(this.textareaEl);
        }

        // 更新textarea大小
        if (this.props.autoResizable) {
            if (this.props.value !== this.state.currentValue || this.props.rows !== prevProps.rows) {
                this.dispatchEvent('autosize:update');
            }
        }
    }

    textareaEl: HTMLTextAreaElement = undefined;
    saveTextarea = (node: HTMLTextAreaElement): void => {
        this.textareaEl = node;
    };

    updateLineHeight = (): void => {
        this.setState({
            lineHeight: getLineHeight(this.textareaEl),
        });
    };

    dispatchEvent = (eventType: string): void => {
        const event = document.createEvent('Event');
        event.initEvent(eventType, true, false);

        this.textareaEl.dispatchEvent(event);
    };

    onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({
            currentValue: e.target.value,
        });
        this.props.onChange(e.target.value, e);
    };

    render(): React.ReactNode {
        let {
            value,
            // @ts-ignore
            placeholder,
            readOnly,
            disabled,
            onChange,
            onFocus,
            className,
            setCursorPosition,
            resizable,
            autoResizable,
            rows,
            maxRows,
            ...props
        } = this.props;
        className = classnames('pdr-textarea', { resizable }, className);

        let style = {};
        if (autoResizable && maxRows) {
            const lineHeight = this.state.lineHeight;
            // 由于有padding，再加20px高度
            const maxHeight = maxRows && lineHeight ? lineHeight * maxRows + 20 : null;
            style = { maxHeight: maxHeight };
        }

        return (
            <div {...props} className={className}>
                <textarea
                    ref={this.saveTextarea}
                    value={value || ''}
                    rows={rows}
                    style={style}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    disabled={disabled}
                    onChange={this.onChange}
                    onFocus={this.props.onFocus}
                />
            </div>
        );
    }
}

export default Textarea;
