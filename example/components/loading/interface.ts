export interface ILoading {
    start: () => void;
    finish: (num?: number) => void;
    count: () => number;
    name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLoading: () => any;
}
