export interface IQueueCallback<T> {
    (resolve: IQueueResolveCallback<T>, reject: IQueueErrorCallback): void | Promise<void>;
} 

export interface IQueueResolveCallback<T> {
    (t: T): void;
}

export interface IQueueErrorCallback {
    (error: string | Error): void;
}

export interface IQueueTaskOptions {
    async?: boolean;
    retryNum?: number;
}

export interface IQueueTaskBuilder<T> {
    async(): Promise<T>;
    then(onResolve: IQueueResolveCallback<T>, onError: IQueueErrorCallback): void;
    with(options: IQueueTaskOptions): IQueueTaskBuilder<T>;
}

export interface IQueueTask<T> {
    id: string;
    async: boolean;
    attempt: number;
    retryNum:  number; 
    callback: IQueueCallback<T>;
    onResolve: IQueueResolveCallback<T>;
    onError?: IQueueErrorCallback;
}

export interface IQueueHandler<T> {
    push(task: IQueueTask<T>): void;
}

export interface IQueue<T> {
    dispatch(callback: IQueueCallback<T>): IQueueTaskBuilder<T>;
}

export interface EventData {

}