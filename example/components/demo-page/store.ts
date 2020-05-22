import { observable, action } from 'mobx';
import PubSub from 'pubsub-js';

class DemoPageStore {
    @observable codeExpand = false;

    @action
    changeCodeExpand = (): void => {
        this.codeExpand = !this.codeExpand;
        // @ts-ignore
        PubSub.publish('pandora.example.code.expand.changed');
    };
}

export default new DemoPageStore();
