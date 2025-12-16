export type MineBarItem = {
    name: string;
    icon: string;
    route?: string;
}

export interface UserInfo {
    isLogin: boolean;
    avatar?: string;
    nickname?: string;
    signature?: string;
    collections?: number;
    history?: number;
    following?: number;
    downloads?: number;
}

export interface FunctionItem {
    title: string;
    icon: string;
    color?: string;
}

export interface FunctionGroup {
    title?: string;
    items: FunctionItem[];
}