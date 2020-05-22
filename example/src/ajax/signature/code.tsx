import React from 'react';
import ajax from 'ajax';
import Button from '../../../components/button';

export default class Code extends React.PureComponent {
    getData = () => {
        ajax.get('/example/signature', {
            userId: 1,
            userName: '姓名',
        });
    };
    addData = () => {
        ajax.post('/example/signature', {
            userId: 1,
            userName: '姓名',
        });
    };
    render(): React.ReactNode {
        return (
            <div>
                <Button
                    type="primary"
                    onClick={(): void => {
                        this.getData();
                    }}>
                    发送请求并签名
                </Button>
                <br />
                <br />
                <Button
                    type="primary"
                    onClick={(): void => {
                        this.addData();
                    }}>
                    发送请求并签名
                </Button>
            </div>
        );
    }
}
