import React from 'react';
import jsonFormat from 'json-format';
import ajax from 'ajax';
import Button from '../../../components/button';
import Textarea from '../../../components/textarea';

export default class Code extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <div>
                <AjaxCryptoFieldCode />
                <AjaxCryptoArrayCode />
                <AjaxCryptoAllCode />
            </div>
        );
    }
}

class AjaxCryptoFieldCode extends React.PureComponent {
    state = {
        method: 'post',
        message: undefined as any,
        plaintext: undefined as any,
        params: {
            userId: 1,
            userName: '姓名',
            pwd: '123456',
            educationInfo: {
                degree: '本科',
                school: '北京大学',
            },
        },
        encrypt: ['pwd', 'educationInfo'],
        getParams: {
            userId: 1,
            userName: '姓名',
            pwd: '123456',
        },
        getEncrypt: ['userName', 'pwd'],
    };

    sendRequestEncrypt = (): void => {
        this.setState({ message: undefined, method: 'post' });
        ajax.post('/example/encrypt', this.state.params, {
            encrypt: this.state.encrypt,
        }).then((data): void => {
            this.setState({ message: data });
        });
    };

    sendGetRequestEncrypt = (): void => {
        this.setState({ message: undefined, method: 'get' });
        ajax.get('/example/encrypt', this.state.getParams, {
            encrypt: this.state.getEncrypt,
        }).then((data): void => {
            this.setState({ message: data });
        });
    };

    sendRequestDecrypt = (): void => {
        this.setState({ plaintext: undefined });
        ajax.post('/example/decrypt').then((data): void => {
            this.setState({ plaintext: data });
        });
    };

    render(): React.ReactNode {
        const { method } = this.state;
        const encryptField = method === 'get' ? this.state.getEncrypt : this.state.encrypt;
        const encryptParams = method === 'get' ? this.state.getParams : this.state.params;
        return (
            <div>
                <h3>加密解密类型：字段</h3>
                <strong>{JSON.stringify(encryptField)}</strong>
                <div className="example-ajax-crypto">
                    <Button
                        type="primary"
                        onClick={(): void => {
                            this.sendRequestEncrypt();
                        }}>
                        加密Post请求数据
                    </Button>
                    <Button
                        type="primary"
                        onClick={(): void => {
                            this.sendGetRequestEncrypt();
                        }}>
                        加密Get请求数据
                    </Button>
                    <div>
                        <div className="row">
                            <div className="col-xs-12 col-md-6">
                                <strong>加密前内容</strong>
                                <Textarea
                                    rows={9}
                                    resizable
                                    value={encryptParams ? jsonFormat(encryptParams) : ''}
                                    readOnly
                                />
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <strong>服务端解密后内容</strong>
                                <Textarea
                                    rows={9}
                                    resizable
                                    value={this.state.message ? jsonFormat(this.state.message) : ''}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        className="btn-decrypt"
                        type="primary"
                        onClick={(): void => {
                            this.sendRequestDecrypt();
                        }}>
                        解密请求响应
                    </Button>
                    <div>
                        <strong>解密响应内容</strong>
                        <Textarea
                            rows={9}
                            resizable
                            value={this.state.plaintext ? jsonFormat(this.state.plaintext) : ''}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        );
    }
}

class AjaxCryptoArrayCode extends React.PureComponent {
    state = {
        message: undefined as any,
        plaintext: undefined as any,
        params: {
            data: [
                {
                    userId: 1,
                    userName: '姓名1',
                    pwd: '123456',
                },
                {
                    userId: 2,
                    userName: '姓名2',
                    pwd: '236789',
                },
                {
                    userId: 3,
                    userName: '姓名3',
                    pwd: 'abcdef',
                    employees: [
                        {
                            employeeId: '1',
                            employeeName: '张三',
                        },
                        {
                            employeeId: '2',
                            employeeName: '李四',
                        },
                    ],
                },
            ],
        },
        encrypt: [
            'data.${index}.pwd',
            'data.${index}.employees.${index}.employeeId',
            'data.${index}.employees.${index}.employeeName',
        ],
    };

    sendRequestEncrypt = (): void => {
        this.setState({ message: undefined });
        ajax.post('/example/encrypt', this.state.params, {
            encrypt: this.state.encrypt,
        }).then((data): void => {
            this.setState({ message: data });
        });
    };

    sendRequestDecrypt = (): void => {
        this.setState({ plaintext: undefined });
        ajax.post('/example/decrypt/decrypt-array').then((data): void => {
            this.setState({ plaintext: data });
        });
    };

    render(): React.ReactNode {
        return (
            <div>
                <h3>加密解密类型：数组（Java端未实现）</h3>
                <div className="example-ajax-crypto">
                    <Button
                        type="primary"
                        onClick={(): void => {
                            this.sendRequestEncrypt();
                        }}>
                        加密发送请求数据
                    </Button>
                    <br />
                    <strong>加密字段：{JSON.stringify(this.state.encrypt)}</strong>
                    <div>
                        <div className="row">
                            <div className="col-xs-12 col-md-6">
                                <strong>加密前内容</strong>
                                <Textarea
                                    rows={12}
                                    resizable
                                    value={this.state.params ? jsonFormat(this.state.params) : ''}
                                    readOnly
                                />
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <strong>服务端解密后内容</strong>
                                <Textarea
                                    rows={12}
                                    resizable
                                    value={this.state.message ? jsonFormat(this.state.message) : ''}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        className="btn-decrypt"
                        type="primary"
                        onClick={(): void => {
                            this.sendRequestDecrypt();
                        }}>
                        解密请求响应
                    </Button>
                    <br />
                    <strong>
                        加密字段：
                        {JSON.stringify([
                            '${index}.pwd',
                            '${index}.employees.${index}.employeeId',
                            '${index}.employees.${index}.employeeName',
                        ])}
                    </strong>
                    <div>
                        <strong>解密响应内容</strong>
                        <Textarea
                            rows={12}
                            resizable
                            value={this.state.plaintext ? jsonFormat(this.state.plaintext) : ''}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        );
    }
}

class AjaxCryptoAllCode extends React.PureComponent {
    state = {
        message: undefined as any,
        plaintext: undefined as any,
        params: {
            userId: 1,
            userName: '姓名',
            pwd: '123456',
        },
    };

    sendRequestEncrypt = (): void => {
        this.setState({ message: undefined });
        ajax.post('/example/encrypt', this.state.params, {
            encrypt: 'all',
        }).then((data): void => {
            this.setState({ message: data });
        });
    };

    sendRequestDecrypt = (): void => {
        this.setState({ plaintext: undefined });
        ajax.post('/example/decrypt/decrypt-all').then((data): void => {
            this.setState({ plaintext: data });
        });
    };

    render(): React.ReactNode {
        return (
            <div>
                <h3>加密解密类型：all</h3>
                <div className="example-ajax-crypto">
                    <Button
                        type="primary"
                        onClick={(): void => {
                            this.sendRequestEncrypt();
                        }}>
                        加密发送请求数据（Java端未实现）
                    </Button>
                    <div>
                        <div className="row">
                            <div className="col-xs-12 col-md-6">
                                <strong>加密前内容</strong>
                                <Textarea
                                    rows={5}
                                    resizable
                                    value={this.state.params ? jsonFormat(this.state.params) : ''}
                                    readOnly
                                />
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <strong>加密前内容</strong>
                                <Textarea
                                    rows={5}
                                    resizable
                                    value={this.state.message ? jsonFormat(this.state.message) : ''}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        className="btn-decrypt"
                        type="primary"
                        onClick={(): void => {
                            this.sendRequestDecrypt();
                        }}>
                        解密请求响应
                    </Button>
                    <div>
                        <strong>解密响应内容</strong>
                        <Textarea
                            rows={5}
                            resizable
                            value={this.state.plaintext ? jsonFormat(this.state.plaintext) : ''}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        );
    }
}
