import { createHashHistory as createHistory, Location, Action } from 'history';

const startTime = +new Date();
const pathname = window.location.hash.replace(/^#/, '');

const history = createHistory();

// 加入对history的监听
const unlisten = history.listen((location: Location, action: Action) => {
    // 执行内容, 第一个参数是当前的location, 第二个是此次执行的动作
    // console.log(action, location.pathname, location.state)
    //document.documentElement.scrollTop = 0;
    const elm = document.querySelector('.module-wrapper');
    if (elm) {
        elm.scrollTop = 0;
    }
});

// 触发listen, 使用的是push动作
// history.push('/home', { some: 'state' })

// 执行函数, 取消监听
// unlisten()

export default history;
