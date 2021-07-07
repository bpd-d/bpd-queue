import { OnEventCallback } from "../events/interfaces";

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
    /**
     * Creates a promise that is resolved after task has been executed
     * Method pushes task to hanlder queue
     */
    async(): Promise<T>;
    /**
     * Creates a task in a sync way.
     * Adds task to queue
     * @param onResolve callback invoked with main callback result
     * @param onError callback invoked with error if occured
     */
    then(onResolve: IQueueResolveCallback<T>, onError: IQueueErrorCallback): void;
    /**
     * Sets task options
     * Object provided as an argument is merged with existing options 
     * @param options options object
     */
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
    /**
     * Pushes task to queue
     * @param task instane
     */
    push(task: IQueueTask<T>): void;
}

export interface IQueue<T> {
    /**
     * Dispatches an callback to a queue
     * @param callback callback to be executed on queue
     * @returns task builder
     */
    dispatch(callback: IQueueCallback<T>): IQueueTaskBuilder<T>;
    /**
     * 
     * @param eventName 
     * @param callback 
     */
    on(eventName: string, callback:OnEventCallback<EventData, void>): string;
    detach(eventName: string, id: string): void;
}

export interface EventData {

}