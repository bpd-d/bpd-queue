import { IEventHandler } from "../events/interfaces";
import { EVENTS } from "../statics";
import { EventData, IQueueHandler, IQueueTask } from "./interfaces";

interface ErrorHandlerCallback {
    (e: string | Error): void;
}

/**
 * Emits error event via event handler
 * @param handler event handler
 * @returns 
 */
function emitError(handler: IEventHandler<EventData, void>): ErrorHandlerCallback {
    return (e: string | Error) => {
        handler.emit(EVENTS.ON_ERROR, e);
    }
}

/**
 * Invokes task rejection method when available
 * @param task task instance
 * @returns 
 */
function pushTaskError<T>(task: IQueueTask<T>): ErrorHandlerCallback {
    return (e: string | Error) => {
        if(task.onError) {
            task.onError(e);
        }
    }
}

/**
 * Handles task retrial.
 * In case of failure task can be executed again if retryNum was bigger than 0
 * Failed task is pushed back as last item to queue
 * @param handler task handler
 * @param task executed task
 * @returns 
 */
function pushBackToQueue<T>( handler: IQueueHandler<T>, task: IQueueTask<T>) {
    return (e: string | Error) => {
        if(task.attempt < task.retryNum) {
            task.attempt += 1;
            handler.push(task)
        }
    }
}

/**
 * Facade method to handle error in task execution
 * @param e error message or error object
 * @param callbacks list of next callbacks that are executed with provided error
 */
function handleError(e: string | Error, callbacks: ErrorHandlerCallback[]): void {
    callbacks.forEach(callback => callback(e));
}

/**
 * Error handler wrapper function
 * @param callbacks to be invoked with error object
 * @returns callback that accpets an error object
 */
function ErrorHandler(...callbacks: ErrorHandlerCallback[]) {
    return (e: string | Error) => {
        handleError(e, callbacks)
    }
}

/**
 * Facade method that handles single task execution
 * @param task task to execute
 * @param handler this task handler
 * @param eventHandler events handler
 * @returns 
 */
async function handleTask<T>(task: IQueueTask<T>, errorHandler: ErrorHandlerCallback) {
    if(task.async) {
            Promise.resolve(task.callback(task.onResolve, (e) => {
                errorHandler(e)
            })).catch((e) => {
                errorHandler(e)
            })
        return;
    }
    // Handle in a sync way
    
    await Promise.resolve(task.callback(task.onResolve, (e) => {
        errorHandler(e);
    }))
}


/**
 * Method creating task handler instance
 * @param eventHandler event handler instance needed for lifecycle events
 * @returns handler instance
 */
export default function TaskHandler<T>(eventHandler: IEventHandler<EventData, void>): IQueueHandler<T> {
    let _lock = false;
    let _tasks: IQueueTask<T>[] = [];

    async function perform() {
        if(_lock) {
            return;
        }
        _lock = true;
        let copy = _tasks.splice(0, _tasks.length);
        await eventHandler.emit(EVENTS.ON_START);
        let task = null;
        while(task = copy.shift()) {
            let errorHandler = ErrorHandler(emitError(eventHandler), pushTaskError(task), pushBackToQueue(handler, task));
            try {
                await handleTask(task, errorHandler);
            } catch(e) {
                errorHandler(e);
            }
            
        }
        await eventHandler.emit(EVENTS.ON_END);
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