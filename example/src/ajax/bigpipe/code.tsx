import React from 'react';
import ajax from 'ajax';
import Button from '../../../components/button';

export default class Code extends React.PureComponent {
    pipeDataByAjax = () => {
        this.clear();
        ajax.post(
            '/bigpipe/ajax',
            {
                a: 1,
            },
            {
                onData: this.onData,
            }
        ).then(() => {
            this.onLoad();
        });
    };

    clear = () => {
        if (this.state.messages.length) {
            this.setState({
                messages: [],
                isLoaded: false,
            });
        }
    };

    state = {
        messages: [] as string[],
        isLoaded: false,
    };

    onData = (message: string): void => {
        const messages = [...this.state.messages, message];
        this.setState({ messages });
    };
    onLoad = (): void => {
        this.setState({ isLoaded: true });
    };

    render(): React.ReactNode {
        const { messages, isLoaded } = this.state;
        return (
            <div>
                <div className="buttons">
                    <Button type="primary" onClick={this.pipeDataByAjax}>
                        发送请求
                    </Button>
                </div>
                <div>服务器在10秒内返回数据如下：</div>
                <ul>
                    {messages.map(
                        (message, index): React.ReactNode => {
                            return (
                                <li key={message}>
                                    第{index + 1}秒返回：{message}
                                </li>
                            );
                        }
                    )}
                </ul>
                <If condition={isLoaded}>
                    <div>请求完成！</div>
                </If>
            </div>
        );
    }
}
