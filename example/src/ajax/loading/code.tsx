import React from 'react';
import ajax from 'ajax';
import Button from '../../../components/button';

export default class Code extends React.PureComponent {
    cancelToken = undefined as string;

    onStart = (): void => {
        if (!this.cancelToken) {
            this.cancelToken = ajax.cancelToken();
        }
        // 请求发送前，会取消未结束的同一cancelToken的请求
        ajax.loadable.get('/load', undefined, { cancelToken: this.cancelToken }).then(
            (): void => {
                window.$feedback('loaded', 'success');
            },
            (error): void => {
                if (ajax.isCancel(error)) {
                    window.$feedback('request canceled', 'warning');
                }
            }
        );
    };

    onCancel = (): void => {
        // 取消请求
        ajax.cancel(this.cancelToken);
    };

    cancelToken2 = undefined as string;

    onStart2 = (): void => {
        if (!this.cancelToken2) {
            this.cancelToken2 = ajax.cancelToken();
        }
        // 请求发送前，会取消未结束的同一cancelToken的请求
        ajax.loadable.get('/load', undefined, { cancelToken: this.cancelToken2 }).then(
            (): void => {
                window.$feedback('loaded', 'success');
            },
            (error): void => {
                if (ajax.isCancel(error)) {
                    window.$feedback('request canceled', 'warning');
                }
            }
        );
    };

    onCancel2 = (): void => {
        // 取消请求
        ajax.cancel(this.cancelToken2);
    };

    render(): React.ReactNode {
        return (
            <div>
                <div className="ajax-cancel">
                    <Button type="primary" onClick={this.onStart}>
                        加载
                    </Button>
                    <Button className="cancel" onClick={this.onCancel}>
                        取消
                    </Button>
                </div>
                <div className="ajax-token-cancel">
                    <Button type="primary" onClick={this.onStart2}>
                        加载
                    </Button>
                    <Button className="cancel" onClick={this.onCancel2}>
                        取消
                    </Button>
                </div>
            </div>
        );
    }
}
