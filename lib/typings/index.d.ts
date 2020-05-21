interface IFeedbackFunction {
    (message: any, type?: 'success' | 'error' | 'warning' | 'tips', time?: number): void;
    clear?: (props?: { animation: boolean }) => void;
}

interface Window {
    $feedback: IFeedbackFunction;
}
