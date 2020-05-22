import React from 'react';
import { Ajax } from 'http-ajax';
import ajax from 'ajax';
import Button from '../../../components/button';

type IPromise<T = any> = Ajax.IPromise<T>;

export default class Code extends React.PureComponent {
    promise = undefined as IPromise;

    state = {
        data: '',
    };

    onStart = (): void => {
        const promise = ajax.get('/pdr/ajax/download', {}, { json: false, responseType: 'blob' });
        this.promise = promise;
        promise.then((data): void => {
            this.setState({ data });
            window.$feedback('download', 'success');
        });
    };

    render(): React.ReactNode {
        let url = '';
        if (this.state.data) {
            url = URL.createObjectURL(this.state.data);
        }
        return (
            <div>
                <div className="ajax-download">
                    <Button type="primary" onClick={this.onStart}>
                        下载文件
                    </Button>
                </div>
                <div className="ajax-download-file">
                    <img className="download-img" src={url} />
                </div>
            </div>
        );
    }
}
