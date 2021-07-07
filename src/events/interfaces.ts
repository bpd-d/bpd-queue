export interface IQueueEvent<T> {
	timestamp: number;
	eventName: string;
	data?: T;
}

export interface IEventHandlerStatus {
	emittedTotal: number;
	emitErrorsCount: number;
	emitSuccessCount: number;
	emitErrors:string[];
	emitSuccess:string[];

}

export interface IStatusManage {
	error(id: string): void;
	success(id: string): void;
	status(): IEventHandlerStatus;
}

export interface EventHandlerItem<T, V> {
	id: string;
	callback: OnEventCallback<T,V>;
}

export interface EventsObj<T, V> {
	[id: string]: EventHandlerItem<T,V>[]
}

export interface OnEventCallback<T, V> {
	(data: IQueueEvent<T>) : V;
}

export interface IEventHandler<T,V> {
	/**
	 * Attaches callback to event
	 * @param eventName event name
	 * @param callback event callback
	 * @returns event id 
	 */
	on(eventName: string, callback: OnEventCallback<T,V>): string;
	/**
	 * Remove specific event from callbacks using name and id
	 * @param eventName event name
	 * @param id event id
	 */
	detach(eventName: string, id: string): void;
	/**
	 * Removes all attached callbacks from event
	 * @param eventName event name
	 */
	detachAll(eventName: string): void;
	/**
	 * Performs event emit. Invokes all callbacks attached to event
	 * @param eventName - event name
	 * @param data - event data
	 * @returns list of result returned by callbacks
	 */
	emit(eventName: string, data?: T): Promise<V[]>;
	/**
	 * Checks whether event handler contains event
	 * @param {String} eventName - event name 
	 * @param {String} id - optional - event id
	 */
	has(eventName: string, id?:string): boolean;
	/**
	 * Retrieves event handler statistics data
	 */
	status(): IEventHandlerStatus;
}

export interface IEventHandlerOptions {
	supportedEvents?: string[];
}