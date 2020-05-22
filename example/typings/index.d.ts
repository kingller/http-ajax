/// <reference path="./json-format.d.ts" />

interface IFeedbackFunction {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (message: any, type?: 'success' | 'error' | 'warning' | 'tips', time?: number): void;
    clear?: (props?: { animation: boolean }) => void;
}

interface Window {
    $feedback: IFeedbackFunction;
}

declare module '!raw-loader!*' {
    const content: string;
    export default content;
}
