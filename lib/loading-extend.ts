import { IAjax, IAjaxArgsOptions, IRequestResult, IOptions, ILoading, IRequestOptions } from './interface';

function loadingExtend({
    getLoading: _getLoading,
}: {
    getLoading: (loadingName: string | symbol) => ILoading;
}): () => void {
    return function load(): void {
        const { beforeSend, responseEnd } = this as IAjax;
        const loadThis = this;
        function getLoading(options: IOptions): ILoading | void {
            if (options.loadingName) {
                if (_getLoading) {
                    return _getLoading(options.loadingName);
                }
                if ((window as object)[options.loadingName]) {
                    const loading = (window as object)[options.loadingName] as ILoading;
                    return loading;
                }
            }
            if (options.context && options.context.loading) {
                return options.context.loading;
            }
            // @ts-ignore
            return window[loadThis.$loading];
        }

        // 启用加载效果
        (this as IAjax).beforeSend = (props: IAjaxArgsOptions): void => {
            const { loadable } = props;
            if (!loadable) {
                return;
            }
            let promise: IRequestResult | void;
            if (beforeSend) {
                promise = beforeSend(props);
            }
            const { options } = props;
            const loadingComponent = getLoading(options);
            if (loadingComponent) {
                loadingComponent.start();
            }
        };

        //关闭加载效果
        (this as IAjax).responseEnd = (
            xhr: XMLHttpRequest,
            _opts: IRequestOptions,
            props: { success: boolean }
        ): void => {
            responseEnd(xhr, _opts, props);
            const { options } = _opts;
            const loadingComponent = getLoading(options);
            if (loadingComponent) {
                loadingComponent.finish();
            }
        };
    };
}
export default loadingExtend;
