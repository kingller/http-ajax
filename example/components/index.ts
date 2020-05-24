export { default as CodeBox } from './code-box/index';
export { default as SourceCode } from './code-box/source-code';
export { default as DemoPage } from './demo-page/index';
export { default as Page } from './page';
export { default as PropsTable } from './props-table';

export type IBoxProps = {
    className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>;
