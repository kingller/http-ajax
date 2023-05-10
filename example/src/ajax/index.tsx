import React from 'react';
import { DemoPage, Page, PropsTable } from '../../components';
import Cache from './cache/box';
import Loading from './loading/box';
import Download from './download/box';
import Crypto from './crypto/box';
import Signature from './signature/box';
import ErrorRequest from './error/box';
import BigPipe from './bigpipe/box';
import TransformResponse from './transform-response/box';
import UrlParams from './url-params/box';
import OptionsParams from './option-params/box';
import './index.css';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const metadataMap = require('!metadata-ts-loader?mapping=true!../../../lib/interface');
const optionsDoc = metadataMap['IOptions'];
const optionsBaseDoc = metadataMap['IOptionsBase'];
const props = Object.assign({}, optionsBaseDoc.props, optionsDoc.props);
delete props['__index'];
optionsDoc.props = props;

export default class Ajax extends React.PureComponent {
    render(): React.ReactNode {
        return (
            <DemoPage>
                <section className="markdown">
                    <p>ajax 用于发送请求和服务器交换数据</p>
                    <h2 id="何时使用">
                        <span>何时使用</span>
                    </h2>
                    <p>封装 ajax 命令，处理不同返回值</p>
                </section>
                <div>
                    <Page>
                        <div className="row">
                            <Cache />
                            <Loading className="ajax-loading" />
                            <Download />
                            <Crypto />
                            <Signature />
                            <ErrorRequest />
                            <BigPipe />
                            <TransformResponse />
                            <UrlParams />
                            <OptionsParams />
                        </div>
                    </Page>
                    <PropsTable title="Options" of={optionsDoc} />
                </div>
            </DemoPage>
        );
    }
}
