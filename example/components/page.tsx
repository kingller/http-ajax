import React from 'react';
import classnames from 'classnames';

interface PageProps {
    title?: string;
    className?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [prop: string]: any;
}

export default class Page extends React.PureComponent<PageProps> {
    render(): React.ReactNode {
        const { title, className, children, ...props } = this.props;

        return (
            <div className={classnames('pdr-example-page', className)} {...props}>
                <h2>{title}</h2>
                {children}
            </div>
        );
    }
}
