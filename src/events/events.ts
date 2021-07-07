import { generator } from "../tools";
import { EventsObj, IEventHandler, IEventHandlerOptions, IEventHandlerStatus, IQueueEvent, IStatusManage, OnEventCallback } from "./interfaces";

const idGenerator = generator();

function createEvent<T>(eventName: string, data?: T): IQueueEvent<T> {
    return {
        timestamp: Date.now(),
        eventName, data
    }
}

function EventStatusHandler(): IStatusManage {
    const _status: IEventHandlerStatus = {
        emitErrorsCount: 0, emittedTotal: 0, emitSuccessCount: 0,
        emitErrors: [], emitSuccess: []
    }
    return {
        error: (id: string) => {
            _status.emittedTotal +=1;
            _status.emitErrorsCount +=1;
            _status.emitErrors.push(id)
        },
        success: (id: string) => {
            _status.emittedTotal +=1;
            _status.emitSuccessCount +=1;
            _status.emitSuccess.push(id);
        },
        status: () => {
            return {
                ..._status
            }
        }
    }
}

export default class EventHandler<T,V> implements IEventHandler<T,V> {
    private _events: EventsObj<T, V>;
    private _statusManage: IStatusManage;
    private _options: IEventHandlerOptions;

	constructor(options?: IEventHandlerOptions) {
        this._events = {};
        this._statusManage = EventStatusHandler();
        this._options = {
            ...options
        }
    }

    on(eventName: string, callback: OnEventCallback<T, V>): string {
        if(this._options?.supportedEvents && !this._options.supportedEvents.includes(eventName)) {
            return null;
        }
       
        if(!this._events[eventName]) {
           this._events[eventName] = [];
       }

       const id = idGenerator.next().value;
       this._events[eventName].push({
           id: id,
           callback
       })

       return id;
    }

    detach(eventName: string, id: string): void {
        if(!this._events[eventName]) {
            return;
        }

        const idx = this._events[eventName].findIndex(item => item.id === id);
        if(idx > -1) {
            this._events[eventName].splice(idx, 1);
        }
    }

    detachAll(eventName: string): void {
        if(!this._events[eventName]) {
            return;
        }

        delete this._events[eventName];
    }

    async emit(eventName: string, data?: T): Promise<V[]> {
        const result: V[] = []
        
        if(!this._events[eventName]){
            return result;
        }
        
        const event = createEvent(eventName, data);

        this._events[eventName].forEach(item => {
            try {
                result.push(item.callback(event));
                this._statusManage.success(item.id);
            } catch(e) {
                this._statusManage.error(item.id);
            }
        })
        return result;
    }

    status(): IEventHandlerStatus {
        return this._statusManage.status();
    }

    has(eventName: string, id?: string): boolean {
        const evArray = this._events[eventName];
        
        if(!evArray || evArray.length == 0) {
            return false;
        }

        if(!id) {
            return true;
        }

        return evArray.find(i => i.id === id) != null;
    }
}
