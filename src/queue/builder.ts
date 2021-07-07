import { generator } from "../tools";
import { IQueueCallback, IQueueErrorCallback, IQueueHandler, IQueueResolveCallback, IQueueTask, IQueueTaskBuilder, IQueueTaskOptions } from "./interfaces";

const idGenerator = generator();

/**
 * Facade method that creates a task object
 * @param callback task callback
 * @param onResolve resolve callback
 * @param onError error callback
 * @param options task options
 * @returns instance of task object
 */
function createTask<T>(callback: IQueueCallback<T>, onResolve: IQueueResolveCallback<T>, onError: IQueueErrorCallback | undefined,  options?: IQueueTaskOptions): IQueueTask<T> {
    return {
        callback,
        onResolve,
        onError,
        id: idGenerator.next().value,
        attempt: 0,
        async: options?.async === true,
        retryNum: options?.retryNum ?? 0
    }
}

/**
 * Method that creates a task builder object
 * @param handler task hanlder instance
 * @param callback task execution callback
 * @returns instance of task builder
 */
export default function TaskBuilder<T>(handler: IQueueHandler<T>, callback:IQueueCallback<T>): IQueueTaskBuilder<T> {
    let _options: IQueueTaskOptions = {};
    const builder: IQueueTaskBuilder<T> = {
        with: (options: IQueueTaskOptions) => {
            _options = {
                ..._options,
                ...options
            }
            return builder;
        },
        then:(onResolve: IQueueResolveCallback<T>, onError?: IQueueErrorCallback) => {
            const task = createTask(callback, onResolve, onError, _options)
            handler.push(task);
        },
        async: () => {
            return new Promise((resolve, reject) => {
                builder.then(resolve, reject);
            })
        }
    }
    return builder;
}