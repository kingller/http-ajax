"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadingExtend(argsOptions) {
    var _getLoading = (argsOptions || {}).getLoading;
    return function load() {
        // 校验该扩展是否已添加过
        if (this._loadingExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `loadingExtend` can only be added to ajax once!');
        }
        // 添加标志符用来校验该扩展是否已添加
        this._loadingExtendAdded = true;
        var _a = this, beforeSend = _a.beforeSend, responseEnd = _a.responseEnd;
        var ajaxThis = this;
        function getLoading(options) {
            if (options.loadingName) {
                if (_getLoading) {
                    return _getLoading({ loadingName: options.loadingName });
                }
                if (window[options.loadingName]) {
                    var loading = window[options.loadingName];
                    return loading;
                }
            }
            if (options.context && options.context.loading) {
                return options.context.loading;
            }
            // @ts-ignore
            return window[ajaxThis.$loading];
        }
        // 启用加载效果
        this.beforeSend = function (props) {
            var loadable = props.loadable;
            var promise;
            if (beforeSend) {
                promise = beforeSend(props);
            }
            if (!loadable) {
                return promise;
            }
            var options = props.options;
            var loadingComponent = getLoading(options);
            if (loadingComponent) {
                loadingComponent.start();
            }
            return promise;
        };
        //关闭加载效果
        this.responseEnd = function (xhr, _opts, props) {
            responseEnd(xhr, _opts, props);
            var options = _opts.options, loading = _opts.loading;
            if (!loading) {
                return;
            }
            var loadingComponent = getLoading(options);
            if (loadingComponent) {
                loadingComponent.finish();
            }
        };
    };
}
exports.default = loadingExtend;
