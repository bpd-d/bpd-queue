import EventHandler from "../src/events/events";
import TaskBuilder from "../src/queue/builder";
import TaskHandler from "../src/queue/handler";
import { IQueueCallback } from "../src/queue/interfaces";

function SimpleCallback(init: string): IQueueCallback<string> {
    return (resolve, reject) => {
        resolve(init);
    }
}

function SimpleError(): IQueueCallback<string> {
    return () => {
        throw new Error("Error");
    }
}

function PromisedError(): IQueueCallback<string> {
    return async (resolve, reject) => {
        reject("Error")
    }
}

function PromisedUnhandledError(): IQueueCallback<string> {
    return async () => {
       throw new Error("error");
    }
}

function PromisedCallback(init: string): IQueueCallback<string> {
    return async (resolve) => {
        resolve(init);
    }
}

function SimplePromisedCallback(init: string): IQueueCallback<string> {
    return (resolve) => {
        return new Promise(() => {
            resolve(init)
        })
    }
}

describe("Tests checking [TaskHandler]", () => {
    let eventHandler = null;

    beforeEach(() => {
        eventHandler = new EventHandler();
    })

    it("Initializes properly", () => {
        const handler = TaskHandler(eventHandler);
        expect(handler).toBeDefined();
    })

    it("Executes task and returns value", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, SimpleCallback("EX"));

        const result = await builder.async();

        expect(result).toEqual("EX");
    })

    it("Executes task and returns value - promise returned by a callback", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, SimplePromisedCallback("EX"));

        const result = await builder.async();

        expect(result).toEqual("EX");
    })

    it("Executes task with promise and returns value", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, PromisedCallback("EX2"));

        const result = await builder.async();

        expect(result).toEqual("EX2");
    })

    it("Handles errors occured during execution - simple", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, SimpleError());
        let wasError = false;
        try {
            await builder.async();
        } catch (e) {
            wasError = true;
        }
        
        expect(wasError).toBeTrue();
    })

    it("Handles errors occured during execution - promise", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, PromisedError());
        let wasError = false;
        try {
            await builder.async();
        } catch (e) {
            wasError = true;
        }
        
        expect(wasError).toBeTrue();
    })

    it("Handles errors occured during execution - promise unhandled", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, PromisedUnhandledError());
        let wasError = false;
        try {
            await builder.async();
        } catch (e) {
            wasError = true;
        }
        
        expect(wasError).toBeTrue();
    })


    it("[ASYNC] Executes task and returns value", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, SimpleCallback("EX"));

        const result = await builder.with({async: true}).async();

        expect(result).toEqual("EX");
    })

    it("[ASYNC - promise] Executes task with promise and returns value", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, SimplePromisedCallback("EX"));

        const result = await builder.with({async: true}).async();

        expect(result).toEqual("EX");
    })

    it("[ASYNC]  Executes task with promise and returns value", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, PromisedCallback("EX2"));

        const result = await builder.with({async: true}).async();

        expect(result).toEqual("EX2");
    })

    it("[ASYNC] Handles errors occured during execution - simple", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, SimpleError());
        let wasError = false;
        try {
            await builder.with({async: true}).async();
        } catch (e) {
            wasError = true;
        }
        
        expect(wasError).toBeTrue();
    })

    it("[ASYNC] Handles errors occured during execution - promise", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, PromisedError());
        let wasError = false;
        try {
            await builder.with({async: true}).async();
        } catch (e) {
            wasError = true;
        }
        
        expect(wasError).toBeTrue();
    })

    it("[ASYNC] Handles errors occured during execution - promise unhandled", async () => {
        const handler = TaskHandler(eventHandler);
        const builder = TaskBuilder(handler, PromisedUnhandledError());
        let wasError = false;
        try {
            await builder.with({async: true}).async();
        } catch (e) {
            wasError = true;
        }
        
        expect(wasError).toBeTrue();
    })


})