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

    postData = () => {
        this.setState({ dataFromPost: null });
        ajax.post<IUser>(
            '/example/users/:userId',
            {
                a: 1,
                b: 2,
            },
            {
                encrypt: ['a', 'pwd'],
                params: {
                    userId: 1,
                    userName: '姓名',
                    pwd: 123456,
                },
            }
        ).then((data) => {
            this.setState({ dataFromPost: data });
        });
    };

    getData = () => {
        this.setState({ dataFromGet: null });
        // 不推荐使用 params
        ajax.get<IUser>(
            '/example/users/:userId',
            {
                a: 1,
                b: 2,
            },
            {
                encrypt: ['a', 'pwd'],
                params: {
                    userId: 1,
                    userName: '姓名',
                    pwd: 123456,
                },
            }
        ).then((data) => {
            this.setState({ dataFromGet: data });
        });
    };

    render(): React.ReactNode {
        const { dataFromGet, dataFromPost } = this.state;
        return (
            <div className="example-ajax-url-params">
                <Button
                    type="primary"
                    onClick={(): void => {
                        this.postData();
                    }}>
                    发送 POST 请求
                </Button>
                <Textarea rows={4} resizable value={dataFromPost ? jsonFormat(dataFromPost) : ''} readOnly />
                <Button
                    type="primary"
                    onClick={(): void => {
                        this.getData();
                    }}>
                    发送 GET 请求
                </Button>
                <Textarea rows={4} resizable value={dataFromGet ? jsonFormat(dataFromGet) : ''} readOnly />
            </div>
        );
    }
}
