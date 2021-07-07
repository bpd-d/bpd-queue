import { IEventHandler } from "../events/interfaces";
import { EVENTS } from "../statics";
import { EventData, IQueueHandler, IQueueTask } from "./interfaces";



interface ErrorHandlerCallback {
    (e: string | Error): void;
}

function emitError(handler: IEventHandler<EventData, void>): ErrorHandlerCallback {
    return (e: string | Error) => {
        handler.emit(EVENTS.ON_ERROR, e);
    }
}

function pushTaskError<T>(task: IQueueTask<T>): ErrorHandlerCallback {
    return (e: string | Error) => {
        if(task.onError) {
            task.onError(e);
        }
    }
}

function pushBackToQueue<T>( handler: IQueueHandler<T>, task: IQueueTask<T>) {
    return (e: string | Error) => {
        if(task.attempt < task.retryNum) {
            task.attempt += 1;
            handler.push(task)
        }
    }
}

function handleError<T>(e: string | Error, callbacks: ErrorHandlerCallback[]): void {
    callbacks.forEach(callback => callback(e));
}

async function handleTask<T>(task: IQueueTask<T>, handler: IQueueHandler<T>,eventHandler: IEventHandler<EventData, void>) {
    let errorHandlers = [emitError(eventHandler), pushTaskError(task), pushBackToQueue(handler, task)];
    if(task.async) {
        Promise.resolve(task.callback(task.onResolve, (e) => {
            handleError(e, errorHandlers)
        })).catch((e) => {
            handleError(e, errorHandlers)
        })
        return;
    }
    // Handle in a sync way
    try {
        await Promise.resolve(task.callback(task.onResolve, (e) => {
            handleError(e, errorHandlers);
        }))
    } catch (e) {
        handleError(e, errorHandlers);
    }
   
}

export default function TaskHandler<T>(eventHandler: IEventHandler<EventData, void>): IQueueHandler<T> {
    let _lock = false;
    let _tasks: IQueueTask<T>[] = [];

    async function perform() {
        if(_lock) {
            return;
        }
        _lock = true;
        let copy = _tasks.splice(0, _tasks.length);
        eventHandler.emit(EVENTS.ON_START);
        let task = null;
        while(task = copy.shift()) {
            await handleTask(task, handler, eventHandler);
        }
        eventHandler.emit(EVENTS.ON_END);
        _lock = false;

        if(_tasks.length > 0) {
            perform();
        }
    }

    const handler = {
        push: (task: IQueueTask<T>) => {
            _tasks.push(task);

            if(!_lock) {
                perform();
            }
        }
    }
    return handler;
}