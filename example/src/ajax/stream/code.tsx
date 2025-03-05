import React from 'react';
import ajax from 'ajax';
import Button from '../../../components/button';

export default class Code extends React.PureComponent {
    pipeDataByAjax = () => {
        this.clear();
        ajax.post(
            '/bigpipe/stream',
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
                <div>服务器返回数据如下：</div>
                <ul style={{ lineHeight: 1.5 }}>{messages.join('')}</ul>
                <If condition={isLoaded}>
                    <div>请求完成！</div>
                </If>
            </div>
        );
    }
}
