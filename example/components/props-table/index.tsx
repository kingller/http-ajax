import React from 'react';
import classnames from 'classnames';
import ReactMarkdown from 'react-markdown';
import { IArrayLike } from '../../types';

type PropsTableProps = {
    of: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
        componentDocs?: IComponentDoc[];
    };
    className?: string;
    title?: string;
    showTitle?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'of' | 'className' | 'showTitle'>;

interface IComponentDoc {
    description?: string;
    displayName?: string;
    methods?: IArrayLike;
    props?: object;
}

export default class PropsTable extends React.PureComponent<PropsTableProps> {
    static defaultProps = {
        className: '',
        title: '',
        showTitle: false,
    };

    getComponentInfo = (): IComponentDoc => {
        const { of } = this.props;
        if (!of) {
            return;
        }
        if (of.componentDocs) {
            if (of.componentDocs.length) {
                return of.componentDocs[0];
            }
        } else {
            return of as IComponentDoc;
        }
    };

    render(): React.ReactNode {
        const { className, showTitle, title, of, ...props } = this.props;
        const componentInfo = this.getComponentInfo();
        if (!componentInfo) {
            return null;
        }
        const componentProps = componentInfo.props;
        if (!componentProps) {
            return null;
        }
        const { displayName } = componentInfo;

        return (
            <div {...props} className={classnames('props-table', className)}>
                <If condition={!!(showTitle && (title || displayName))}>
                    <h2>{title || displayName}</h2>
                </If>
                <table>
                    <thead>
                        <tr>
                            <th>参数</th>
                            <th>类型</th>
                            <th>默认值</th>
                            <th>说明</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(componentProps).map(
                            (prop): React.ReactNode => {
                                return <Row key={prop.name} {...prop} />;
                            }
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

interface RowProps {
    type?: IRowType;
    defaultValue?: null | { value?: string };
    required?: boolean;
    name?: string;
    description?: string;
}

interface IRowType {
    name?: string;
    value?: IRowType | IArrayLike;
    raw?: string;
}

class Row extends React.PureComponent<RowProps> {
    getType = (): string => {
        const { type } = this.props;
        if (!type) {
            return '';
        }
        return this.getText(type);
    };

    getText = (info: IRowType, parentName?: string): string => {
        let { name, value, raw } = info;
        if (value && Array.isArray(value)) {
            if (name === 'enum') {
                value = value.map((v): string => {
                    return v.value;
                });
            } else {
                value = value.map((v): string => {
                    if (v.value && typeof v.value === 'object') {
                        return this.getText(v, name);
                    }
                    return this.getRawText(v.raw) || v.name;
                });
            }
            return value.join(' | ');
        } else if (typeof value === 'object') {
            if (name === 'shape') {
                return this.getShapeText(value as IRowType, parentName);
            }
            return this.getText(value as IRowType, name);
        }
        return this.getRawText(raw) || name;
    };

    getRawText = (raw?: string): string => {
        if (!raw || typeof raw !== 'string') {
            return;
        }
        return raw.replace(/(PropTypes\.)|(\.isRequired)/g, '');
    };

    getShapeText = (value: IRowType, parentName: string): string => {
        const formatValue = `{${Object.keys(value).join(', ')}}`;
        if (parentName && parentName !== 'shape' && parentName !== 'union') {
            return `${parentName}(${formatValue})`;
        }
        return formatValue;
    };

    getDefaultValue = (): string | React.ReactElement => {
        const { defaultValue, required } = this.props;
        if (defaultValue && defaultValue.value) {
            if (typeof defaultValue.value === 'string') {
                return defaultValue.value.replace(/^_strategies\./, '');
            }
            return defaultValue.value;
        }
        if (required) {
            return <span>required</span>;
        }
        return '';
    };

    render(): React.ReactNode {
        const { name, description } = this.props;
        return (
            <tr>
                <td>{name}</td>
                <td>{this.getType()}</td>
                <td>{this.getDefaultValue()}</td>
                <td>
                    <ReactMarkdown source={description} />
                </td>
            </tr>
        );
    }
}
