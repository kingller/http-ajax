interface IFeedbackFunction {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (message: any, type?: 'success' | 'error' | 'warning' | 'tips', time?: number): void;
    clear?: (props?: { animation: boolean }) => void;
}

interface Window {
    $feedback: IFeedbackFunction;
}
