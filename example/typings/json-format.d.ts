declare module 'json-format' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type JSONFormatFn = (data: any, config?: { type?: 'tab' | 'space'; size?: number }) => string;

    const JSONFormat: JSONFormatFn;

    export default JSONFormat;
}
