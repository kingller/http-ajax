import React from 'react';
import ajax from 'ajax';
import Button from '../../../components/button';

export default class Code extends React.PureComponent {
    onStart = (): void => {
        // 请求发送前，会取消未结束的同一cancelToken的请求
        ajax.loadable.get('/load2').then((): void => {
            window.$feedback('loaded', 'success');
        });
    };

    render(): React.ReactNode {
        return (
            <Button type="primary" onClick={this.onStart}>
                发送请求
            </Button>
        );
    }
}
