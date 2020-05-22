import React from 'react';
import classnames from 'classnames';
import ReactMarkdown from 'react-markdown';

type IStoreProps = {
    sourceFile: string | string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store: { [key: string]: any } | Function;
    title?: string;
    description?: string;
    type?: string;
    className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'sourceFile' | 'store' | 'title' | 'description' | 'type'>;

export default class StoreProps extends React.PureComponent<IStoreProps> {
    static defaultProps = {
        title: 'StoreProps',
        type: 'props',
    };

    getSourceFiles = (): string[] => {
        const { sourceFile } = this.props;
        if (typeof sourceFile === 'string') {
            return [sourceFile];
        }
        return sourceFile;
    };

    getType = (value: any): string => {
        const type = typeof value;
        if (type === 'object' && Array.isArray(value)) {
            return 'array';
        }
        return type;
    };

    loadStoreProps = (): RowProps[] => {
        const { store } = this.props;
        const regexp = /\/\*\*\s+[\s\S]+?\s+\*\/\n\s+\b(\w+)\b:\s+(.+)\s+/g;
        const nameRegexp = /\n\s+\b(\w+)\b/;
        const descriptionReg = /\/\*\*\s+([\s\S]+?)\s+\*\//;
        const correspondPropsReg = /:\s+'(.+)'/;
        const storePropMap: { [name: string]: RowProps } = {};
        // @ts-ignore
        const comStore = new store();
        const sourceFiles = this.getSourceFiles();
        if (sourceFiles) {
            sourceFiles.forEach((sourceFile) => {
                const allProps = sourceFile.match(regexp);
                allProps.forEach((value): void => {
                    const info: RowProps = {};
                    const propName = value.match(correspondPropsReg)[1].trim();
                    const name = value.match(nameRegexp)[1].trim();
                    info.name = name;
                    info.description = value.match(descriptionReg)[1].trim();
                    info.type = this.getType(comStore[propName]);
                    info.defaultValue = comStore[propName];
                    info.outdatedName = propName;
                    storePropMap[name] = info;
                });
            });
        }
        const storeProps: RowProps[] = Object.values(storePropMap);
        return storeProps;
    };

    loadParams = (): RowProps[] => {
        const { store } = this.props;
        const regexp = /\/\*\*\s+((.+))\s+\*\//g;
        const nameRegexp = /\b(\w+)\b:/;
        const descriptionReg = /:\s+(.+)\s+/;
        const params = [] as object[];
        const sourceFiles = this.getSourceFiles();
        if (sourceFiles) {
            sourceFiles.forEach((sourceFile) => {
                const allProps = sourceFile.match(regexp);
                if (allProps) {
                    allProps.forEach((value): void => {
                        const object: RowProps = {};
                        const valueMatches = value.match(nameRegexp);
                        if (valueMatches) {
                            object.name = valueMatches[1].trim();
                            object.description = value.match(descriptionReg)[1].trim();
                            // @ts-ignore
                            object.type = this.getType(store[object.name]);
                            // @ts-ignore
                            object.defaultValue = store[object.name];
                            params.push(object);
                        }
                    });
                }
            });
        }
        return params;
    };

    render(): React.ReactNode {
        const { title, description, sourceFile, store, type, className, ...props } = this.props;

        return (
            <div {...props} className={classnames('props-table', className)}>
                <h2> {title} </h2>
                <If condition={!!description}>
                    <div className="description">{description}</div>
                </If>
                <table>
                    <thead>
                        <tr>
                            <th>参数</th>
                            <th>类型</th>
                            <th>默认值</th>
                            <th>说明</th>
                            <th>旧参数名</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(
                            this.props.type === 'params' ? this.loadParams() : this.loadStoreProps(),
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
    name?: string;
    description?: string;
    type?: string;
    defaultValue?: string | object;
    outdatedName?: string;
}

class Row extends React.PureComponent<RowProps> {
    getDefaultValue = (defaultValue: string | object, type: string): string => {
        if (defaultValue !== undefined && typeof defaultValue !== 'string') {
            if (type === 'function' || type === 'object') {
                return '';
            }
            return String(defaultValue);
        }
        return defaultValue as string;
    };
    render(): React.ReactNode {
        const { name, description, type, defaultValue, outdatedName } = this.props;
        return (
            <tr>
                <td>{name}</td>
                <td>{type !== 'undefined' ? type : ''}</td>
                <td>{this.getDefaultValue(defaultValue, type)}</td>
                <td>
                    <ReactMarkdown source={description} />
                </td>
                <td>{outdatedName}</td>
            </tr>
        );
    }
}
