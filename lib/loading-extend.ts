import { IAjax, IAjaxArgsOptions, IRequestResult, IOptions, ILoading, IRequestOptions } from './interface';

function loadingExtend(argsOptions?: {
    getLoading: (props: { loadingName: string | symbol }) => ILoading;
}): () => void {
    const { getLoading: _getLoading } = argsOptions || {};

    return function load(): void {
        // 校验该扩展是否已添加过
        if (this._loadingExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `loadingExtend` can only be added to ajax once!');
        }

        // 添加标志符用来校验该扩展是否已添加
        this._loadingExtendAdded = true;

        const { beforeSend, responseEnd } = this as IAjax;
        const ajaxThis = this;
        function getLoading(options: IOptions): ILoading | void {
            if (options.context && options.context.loading) {
                return options.context.loading;
            }
            const { loadingName } = options;
            if (_getLoading) {
                const customLoading = _getLoading({ loadingName: loadingName || ajaxThis.$loading });
                if (customLoading) {
                    return customLoading;
                }
            }
            if (loadingName) {
                if ((window as object)[loadingName]) {
                    const loading = (window as object)[loadingName] as ILoading;
                    return loading;
                }
            }
            // @ts-ignore
            return window[ajaxThis.$loading];
        }

        // 启用加载效果
        (this as IAjax).beforeSend = (props: IAjaxArgsOptions): IRequestResult | void => {
            const { loading } = props;
            if (loading) {
                const { options } = props;
                const loadingComponent = getLoading(options);
                if (loadingComponent) {
                    loadingComponent.start({ estimatedDuration: options.estimatedDuration });
                }
            }
            if (beforeSend) {
                return beforeSend(props);
            }
        };

        // 关闭加载效果
        (this as IAjax).responseEnd = (
            xhr: XMLHttpRequest,
            _opts: IRequestOptions,
            props: { success: boolean }
        ): void => {
            responseEnd(xhr, _opts, props);
            const { options, loading } = _opts;
            if (!loading) {
                return;
            }
            const loadingComponent = getLoading(options);
            if (loadingComponent) {
                loadingComponent.finish();
            }
        };
    };
}
export default loadingExtend;
