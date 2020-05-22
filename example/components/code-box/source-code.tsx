import React from 'react';
// @ts-ignore
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/prism-light';
// @ts-ignore
import jsx from 'react-syntax-highlighter/dist/languages/prism/jsx';
import coy from 'react-syntax-highlighter/dist/styles/prism/coy';
import { IArrayLike } from '../../types';

registerLanguage('jsx', jsx);

interface SourceCodeProps {
    value?: string | IArrayLike;
}

export default class SourceCode extends React.Component<SourceCodeProps> {
    render(): React.ReactNode {
        const { value } = this.props;

        const source = React.Children.map(
            value,
            (code): React.ReactNode => {
                return (
                    <SyntaxHighlighter className="code-demo-box" language="jsx" style={coy}>
                        {code}
                    </SyntaxHighlighter>
                );
            }
        );

        return source;
    }
}
