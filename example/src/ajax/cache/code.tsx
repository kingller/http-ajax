import React from 'react';
import ajax from 'ajax';
import Button from '../../../components/button';

import { IArrayLike } from '../../../types';

export default class Code extends React.PureComponent {
    state = {
        serverData: [] as IArrayLike,
        cacheData: [] as IArrayLike,
    };

    severTime = (): void => {
        ajax.get<string>('/pdr/ajax/send', {
            userId: 1,
            userName: 'severTime',
        }).then((data): void => {
            const serverData = [...this.state.serverData, data];
            this.setState({ serverData });
        });
    };

    cacheTime = (): void => {
        ajax.get<string>(
            '/pdr/ajax/cache',
            {
                userId: 2,
                userName: 'cacheTime',
            },
            { cache: true }
        ).then((data): void => {
            const cacheData = [...this.state.cacheData, data];
            this.setState({ cacheData });
        });
    };

    clearData = (): void => {
        this.setState({
            serverData: [],
            cacheData: [],
        });
    };

    removeCache = (): void => {
        ajax.removeCache('/pdr/ajax/cache', {
            userId: 2,
            userName: 'cacheTime',
        });
    };

    clearCache = (): void => {
        ajax.clearCache();
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
                    <Button
                        className="pdr-btn"
                        type="important"
                        onClick={(): void => {
                            this.cacheTime();
                        }}>
                        缓存请求
                    </Button>
                    <Button
                        className="pdr-btn"
                        onClick={(): void => {
                            this.clearData();
                        }}>
                        清除屏幕显示数据
                    </Button>
                    <Button
                        className="pdr-btn"
                        onClick={(): void => {
                            this.removeCache();
                        }}>
                        清除指定缓存
                    </Button>
                    <Button
                        className="pdr-btn"
                        onClick={(): void => {
                            this.clearCache();
                        }}>
                        清除所有缓存
                    </Button>
                </div>
                <div className="markdown">
                    <p>发送请求后获得服务器端时间</p>
                    <ul>
                        {this.state.serverData.map(
                            (message, index): React.ReactNode => {
                                return <li key={index}>{message}</li>;
                            }
                        )}
                    </ul>
                    <p>缓存获得服务器端时间的请求</p>
                    <ul>
                        {this.state.cacheData.map(
                            (message, index): React.ReactNode => {
                                return <li key={index}>{message}</li>;
                            }
                        )}
                    </ul>
                </div>
            </div>
        );
    }
}
