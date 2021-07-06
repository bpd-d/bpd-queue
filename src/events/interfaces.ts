export interface IQueueEvent {
	timestamp: number;
	eventName: string;
}

export interface IEventHandler {
	on(eventName: string, callback): string;
	detach(eventName: string): void;
}
