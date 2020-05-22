import React from 'react';
import { DemoPage, Page, StoreProps } from '../../components';
import ajax from 'ajax';
import Cache from './cache/box';
import Loading from './loading/box';
import Download from './download/box';
import Crypto from './crypto/box';
import Signature from './signature/box';
import './index.css';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sourceFile = require('!raw-loader!../../../lib/interface');
export default class Ajax extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <DemoPage>
                <section className="markdown">
                    <p>ajax用于发送请求和服务器交换数据</p>
                    <h2 id="何时使用">
                        <span>何时使用</span>
                    </h2>
                    <p>封装ajax命令，处理不同返回值</p>
                </section>
                <Page>
                    <div className="row">
                        <Cache />
                        <Loading className="ajax-loading" />
                        <Download />
                        <Crypto />
                        <Signature />
                    </div>
                </Page>
                <StoreProps title="Options" sourceFile={sourceFile} store={ajax} type="params" />
            </DemoPage>
        );
    }
}
