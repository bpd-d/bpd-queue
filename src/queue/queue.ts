import EventHandler from "../events/events";
import TaskBuilder from "./builder";
import TaskHandler from "./handler";
import { EventData, IQueue, IQueueCallback } from "./interfaces";

export function Queue<T>(): IQueue<T> {
    const _eventHandler = new EventHandler<EventData, void>();
    const _handler = TaskHandler<T>(_eventHandler);

    return {
        dispatch: (callback: IQueueCallback<T>) => {
            return TaskBuilder(_handler, callback);
        }
    }
}