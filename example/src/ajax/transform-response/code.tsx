import React from 'react';
import ajax from 'ajax';
import Button from '../../../components/button';
import jsonFormat from 'json-format';
import Textarea from '../../../components/textarea';

export default class Code extends React.PureComponent {
    state = {
        serverData: {},
    };

    severTime = (): void => {
        ajax.get<{
            data: string;
            headers: { [name: string]: any };
        }>(
            '/pdr/ajax/send',
            {
                userId: 1,
                userName: 'severTime',
            },
            {
                transformResponse: (data: string, headers: { [name: string]: any }) => {
                    const responseData = {
                        data,
                        headers,
                    };
                    return responseData;
                },
            }
        ).then((response): void => {
            const serverData = { ...this.state.serverData, ...response };
            this.setState({ serverData });
        });
    };

    render(): React.ReactNode {
        return (
            <div>
                <div className="buttons ">
                    <Button
                        className="pdr-btn"
                        type="primary"
                        onClick={(): void => {
                            this.severTime();
                        }}>
                        发送请求
                    </Button>
                </div>
                <div className="markdown">
                    <p>获得自定义响应体</p>
                    <Textarea rows={9} resizable value={jsonFormat(this.state.serverData)} readOnly />
                </div>
            </div>
        );
    }
}
