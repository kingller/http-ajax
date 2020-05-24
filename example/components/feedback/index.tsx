import React from 'react';
import { Component } from 'react';
import { render } from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import _ from 'lodash';
import Feedback from './feedback';

interface IFeedback {
    type: IFeedbackType;
    message: string | React.ReactNode;
    date: number;
    key: string;
    visible: boolean;
}

export type IFeedbackType = 'success' | 'error' | 'warning' | 'tips';

class Store {
    interval = null as number;
    @observable
    feedbacks = [] as IFeedback[];
    @observable
    mouseEnterFeedback = null as IFeedback;

    @action
    add = (message: string | React.ReactNode, type: IFeedbackType = 'error', time = 5): void => {
        if (typeof type === 'number') {
            [type, time] = ['error', type];
        }
        const feedback: IFeedback = {
            type,
            message,
            date: Date.now() + time * 1000,
            key: Math.random() + '',
            visible: true,
        };
        this.feedbacks.push(feedback);
        if (this.feedbacks.length === 1) this.setInterval();
    };

    @action
    remove = (index: string): void => {
        _.pullAt(this.feedbacks, _.toNumber(index));
        this.mouseEnterFeedback = null;
    };

    @action
    removeExpired = (): void => {
        for (let index = this.feedbacks.length - 1; index >= 0; index--) {
            const item = this.feedbacks[index];
            if (item.date <= Date.now()) {
                if (item.visible) {
                    if (this.mouseEnterFeedback) continue;
                    item.visible = false;
                    item.date = item.date + 400;
                } else {
                    _.pull(this.feedbacks, item);
                }
            }
        }
    };

    @action
    clear = (props?: { animation: boolean }): void => {
        if (props && props.animation === false) {
            this.feedbacks = [];
        } else {
            this.feedbacks.forEach((feedback): void => {
                feedback.date = Date.now();
            });
        }
    };

    @action
    handleMouseEnter = (index: string): void => {
        this.mouseEnterFeedback = this.feedbacks[_.toNumber(index)];
    };
    @action
    handleMouseLeave = (): void => {
        this.mouseEnterFeedback = null;
    };

    setInterval = (): void => {
        this.interval = window.setInterval((): void => {
            this.removeExpired();
            if (this.feedbacks.length === 0) clearInterval(this.interval);
        }, 200);
    };
}
const feedback = new Store();
let container = null as HTMLElement;

window.$feedback =
    // @ts-ignore
    Component.prototype.$feedback = function (
        message: string | React.ReactNode,
        type?: IFeedbackType,
        time?: number
    ): void {
        if (!container) {
            container = document.createElement('div');
            container.className = 'hr1-feedback-wrapper';
            document.body.appendChild(container);

            render(<FeedbacksTransition />, container);
        }
        feedback.add(message, type, time);
    };

window.$feedback.clear = (props?: { animation: boolean }): void => {
    feedback.clear(props);
};

@observer
class FeedbacksTransition extends React.Component {
    render(): React.ReactNode {
        return (
            <div>
                {Array.from(feedback.feedbacks).map(
                    (item, index): React.ReactNode => {
                        return (
                            <Feedback
                                className={item.visible ? '' : 'leave'}
                                key={item.key}
                                index={index}
                                type={item.type}
                                onClick={feedback.remove}
                                onMouseEnter={feedback.handleMouseEnter}
                                onMouseLeave={feedback.handleMouseLeave}>
                                {item.message}
                            </Feedback>
                        );
                    }
                )}
            </div>
        );
    }
}
