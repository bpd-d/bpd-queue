import EventHandler from "../src/events/events";
import { IQueueEvent } from "../src/events/interfaces";

function SimpleCallback(data: IQueueEvent<string>) {
    return data.data;
}

function ErrorCallback(data: IQueueEvent<string>): string {
    throw new Error("Error");
}

const testEventName = "test";

describe("Tests checking EventHandler for Queue", () => {
   it("initializes properly", () => {
       const handler = new EventHandler();

       expect(handler).toBeDefined();
   })

   it("Attaches to event handler", () => {
        const handler = new EventHandler<string, string>();

        const id = handler.on(testEventName, SimpleCallback);
        const hasEvent = handler.has(testEventName, id);

        expect(id).toBeDefined();
        expect(hasEvent).toBeTrue();
    })

    it("Detaches from event handler", () => {
        const handler = new EventHandler<string, string>();

        const id = handler.on(testEventName, SimpleCallback);
        const hasEventBefore = handler.has(testEventName, id);
        handler.detach(testEventName, id);
        const hasEventAfter = handler.has(testEventName, id);

        
        expect(id).toBeDefined();
        expect(hasEventBefore).toBeTrue();
        expect(hasEventAfter).toBeFalse();
    })


    it("Detaches all events from event handler", () => {
        const handler = new EventHandler<string, string>();

        const id = handler.on(testEventName, SimpleCallback);
        const hasEventBefore = handler.has(testEventName, id);
        handler.detach(testEventName, id);
        const hasEventAfter = handler.has(testEventName, id);

        
        expect(id).toBeDefined();
        expect(hasEventBefore).toBeTrue();
        expect(hasEventAfter).toBeFalse();
    })

    it("Emits the event", async () => {
        const handler = new EventHandler<string, string>();

        handler.on(testEventName, SimpleCallback);
        const result = await handler.emit(testEventName, "EX");
        expect(result[0]).toEqual("EX");
    })

    it("Emit error is handled and no result is returned", async () => {
        const handler = new EventHandler<string, string>();

        handler.on(testEventName, ErrorCallback);
        const result = await handler.emit(testEventName, "EX");
        expect(result.length).toEqual(0);
    })

    it("In multiple callbacks, all are executed regardless of failing ones", async () => {
        const handler = new EventHandler<string, string>();
        handler.on(testEventName, ErrorCallback);
        handler.on(testEventName, SimpleCallback);

        const result = await handler.emit(testEventName, "EX");

        expect(result.length).toEqual(1);
        expect(result[0]).toEqual("EX");
    })

    it("Gives a proper statistics for emits", async () => {
        const handler = new EventHandler<string, string>();
        handler.on(testEventName, ErrorCallback);
        handler.on(testEventName, SimpleCallback);

        await handler.emit(testEventName, "EX");
        const stats = handler.status();

        expect(stats.emitErrorsCount).toEqual(1);
        expect(stats.emitSuccessCount).toEqual(1);
        expect(stats.emittedTotal).toEqual(2);
    })
    
})