import EventHandler from "../events/events";
import { OnEventCallback } from "../events/interfaces";
import TaskBuilder from "./builder";
import TaskHandler from "./handler";
import { EventData, IQueue, IQueueCallback } from "./interfaces";

export function Queue<T>(): IQueue<T> {
    const _eventHandler = new EventHandler<EventData, void>();
    const _handler = TaskHandler<T>(_eventHandler);

    return {
        dispatch: (callback: IQueueCallback<T>) => {
            return TaskBuilder(_handler, callback);
        },
        on: (eventName: string, callback: OnEventCallback<EventData, void>) => {
            return _eventHandler.on(eventName, callback);
        },
        detach: (eventName: string, id: string) => {
            if(id) {
                _eventHandler.detach(eventName, id);
                return;
            }

            _eventHandler.detachAll(eventName);
        }
    }
}