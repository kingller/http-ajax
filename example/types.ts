import { IObservableArray } from 'mobx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IArrayLike<T = any> = T[] | IObservableArray<T>;

// prettier-ignore
export interface IClassStyle {
    /** 自定义类名 */
    className?: string;
    /**
     * 鉴于以下原因不推荐使用`style`属性  
     * 1. `style`属性接受一个对象，基本上都是新建对象，导致组件额外的渲染。  
     * 2. `style`属性需要自行处理`CSS`前缀，容易出错。  
     */
    style?: React.CSSProperties;
}
