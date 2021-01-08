import React from 'react';
import ajax from 'ajax';
import jsonFormat from 'json-format';
import Button from '../../../components/button';
import Textarea from '../../../components/textarea';

interface IUser {
    userId: string;
    userName: string;
}

export default class Code extends React.PureComponent {
    state: {
        dataFromGet: IUser;
        dataFromPost: IUser;
    } = {
        dataFromGet: null,
        dataFromPost: null,
    };

    getData = () => {
        this.setState({ dataFromGet: null });
        ajax.get<IUser>('/example/user/:userId', {
            userId: 1,
            userName: '姓名',
        }).then((data) => {
            this.setState({ dataFromGet: data });
        });
    };
    postData = () => {
        this.setState({ dataFromPost: null });
        ajax.post<IUser>('/example/user/:userId', {
            userId: 1,
            userName: '姓名',
        }).then((data) => {
            this.setState({ dataFromPost: data });
        });
    };
    render(): React.ReactNode {
        const { dataFromGet, dataFromPost } = this.state;
        return (
            <div className="example-ajax-url-params">
                <Button
                    type="primary"
                    onClick={(): void => {
                        this.getData();
                    }}>
                    发送GET请求
                </Button>
                <Textarea rows={4} resizable value={dataFromGet ? jsonFormat(dataFromGet) : ''} readOnly />
                <Button
                    type="primary"
                    onClick={(): void => {
                        this.postData();
                    }}>
                    发送POST请求
                </Button>
                <Textarea rows={4} resizable value={dataFromPost ? jsonFormat(dataFromPost) : ''} readOnly />
            </div>
        );
    }
}
