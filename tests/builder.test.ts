import {IQueueCallback, IQueueHandler, IQueueTask} from "../src/queue/interfaces";
import TaskBuilder from "../src/queue/builder";

interface IQueueHandlerMockup<T> extends IQueueHandler<T> {
    get(): IQueueTask<T>[];
}

function TaskHandlerMockup<T>(): IQueueHandlerMockup<T> {
    const tasks = [];
    return {
        push: (task: IQueueTask<T>) => {
            tasks.push(task)
        },
        get: () => {
            return tasks;
        }
    }
}

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

describe("Tests related to [TaskBuilder]", () => {
    let handler = null;

    beforeEach(() => {
        handler = TaskHandlerMockup();
       
    })

    it("Initializes properly", () => {
        const builder = TaskBuilder<string>(handler, SimpleCallback("XX"));
        
        expect(builder).toBeDefined();
    })

    it("Adds task to handler properly", () => {
        const builder = TaskBuilder<string>(handler, SimpleCallback("XX"));
        builder.async();
        const task = handler.get()[0];

        expect(task).toBeDefined();

    })

    it("Sets default options when building a task instance", () => {
        const builder = TaskBuilder<string>(handler, SimpleCallback("XX"));
        builder.async();
        const task = handler.get()[0];

        expect(task.async).toBeFalse();
        expect(task.retryNum).toEqual(0);
        expect(task.attempt).toEqual(0);
        expect(task.callback).toBeDefined();
        expect(task.onError).toBeDefined();
        expect(task.onResolve).toBeDefined();
    })

    it("Sets [async] option when building a task instance", () => {
        const builder = TaskBuilder<string>(handler, SimpleCallback("XX"));
        builder.with({async: true}).async();
        const task = handler.get()[0];

        expect(task.async).toBeTrue();
    })

    it("Sets [retryNum] option when building a task instance", () => {
        const builder = TaskBuilder<string>(handler, SimpleCallback("XX"));
        builder.with({retryNum: 10}).async();
        const task = handler.get()[0];

        expect(task.retryNum).toEqual(10);
    })

    it("Sets merges options in chain when building a task instance", () => {
        const builder = TaskBuilder<string>(handler, SimpleCallback("XX"));
        builder.with({retryNum: 10}).with({async: true}).async();
        const task = handler.get()[0];

        expect(task.retryNum).toEqual(10);
        expect(task.async).toBeTrue();
    })
})