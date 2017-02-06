/**
 * Created by Yinxiong on 2017/2/6.
 */



declare namespace Flyout {

}

interface FlyoutOptions {
    destroy?: boolean;
    //不会被全局隐藏，不会隐藏全局，独立存在
    alone?: boolean;
    //点击其他位置是否隐藏
    clickDocumentHide?: boolean;
    //点击同一个锚点时是否隐藏
    sameAnchorHide?: boolean;
    //隐藏的方向
    hideDirect?: string;
    //自动隐藏的停留时间
    stayTime?: number;
    //锚点悬停时是否持续显示
    anchorStay?: boolean;
    //隐藏位置偏移量
    hideOffset?: number;
    //显示位置偏移量
    showOffset?: number;
    //动画时间
    showDuration?: number;
    easing?: string;
    classStyle?: string;
    alignment?: string;
    placement?: string;
    arrow?: boolean;
    stop?: boolean;
    events?: Object;
}

export function tips(anchor: HTMLElement, html: string, options: FlyoutOptions)
export function confirm(anchor: HTMLElement, ok = Function, html = String)
export = Flyout