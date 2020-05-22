import { observable, action } from 'mobx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
const LoadingBase = (Base: any = class {}) => {
    class LoadingBaseStore extends Base {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        static enhance: any;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _component: any = null;

        //loading个数
        @observable
        _loadingCount = 0;
        //未启动的loading个数
        _notStartLoadingCount = 0;

        //默认loading名称 - 当父级没有loading组件时使用
        _$loading = '$loading';

        //当该值设为true时 - 当父级没有loading组件时使用默认loading
        useLoadingAnyway = false;

        // 初始化 - 在组件constructor中使用，并须定义context
        // static contextTypes = {
        //     loading: PropTypes.object,
        // }
        // 或搭配loadingMixin使用
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @action initLoadingStore(component: any): void {
            this._component = component;
            if (this._notStartLoadingCount > 0) {
                this._startFirstLoading();
            }
        }

        //清除 - 在组件componentWillUnmount中调用
        @action
        clearLoadingStore(): void {
            if (this._loadingCount - this._notStartLoadingCount > 0) {
                const $loading = this._getLoading();
                if ($loading) {
                    $loading.finish(this._loadingCount - this._notStartLoadingCount);
                }
            }
            this._component = null;
            this._notStartLoadingCount = 0;
            this._loadingCount = 0;
        }

        _startFirstLoading = (): void => {
            const $loading = this._getLoading();
            if ($loading) {
                $loading.start();
                this._notStartLoadingCount--;
            }
        };

        //获取loading
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _getLoading = (): any => {
            if (this._component) {
                //如果组件上有getLoading，则使用组件内的loading，否则使用context中的loading
                if (typeof this._component.getLoading === 'function') {
                    return this._component.getLoading();
                }
                if (this._component.context && this._component.context.loading) {
                    return this._component.context.loading;
                }
            }
            if (this.useLoadingAnyway) {
                const name = this._$loading;
                // @ts-ignore
                if (name && window[name]) {
                    // @ts-ignore
                    return window[name];
                }
            }
            return undefined;
        };

        /** 显示loading */
        @action
        startLoading = (): { finish: () => void } => {
            this._loadingCount++;
            this._notStartLoadingCount++;
            const $loading = this._getLoading();
            if ($loading) {
                $loading.start();
                if (this._notStartLoadingCount > 0) {
                    this._notStartLoadingCount--;
                }
            }

            return {
                finish: (): void => {
                    this.endLoading($loading);
                },
            };
        };

        /** 隐藏loading */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @action endLoading = ($loading?: any): void => {
            if (this._loadingCount > 0) {
                this._loadingCount--;
            }
            if (this._notStartLoadingCount > 0) {
                this._notStartLoadingCount--;
                return;
            }
            if (!$loading) {
                $loading = this._getLoading();
            }
            if ($loading) {
                $loading.finish();
            }
        };
    }

    return LoadingBaseStore;
};

const LoadingStore = LoadingBase();
LoadingStore.enhance = LoadingBase;

export default LoadingStore;
