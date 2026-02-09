// memoryQueue.ts

type Task<T> = () => Promise<T>;

class MemoryQueue {
    private queue: Task<any>[] = [];
    private isProcessing: boolean = false;

    /**
     * Adds a task to the queue and starts processing if idle.
     * @param task A function that returns a Promise
     */
    async enqueue<T>(task: Task<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            // Wrap the task to capture the result/error
            const wrappedTask = async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            this.queue.push(wrappedTask);
            this.processNext();
        });
    }

    private async processNext() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const currentTask = this.queue.shift();

        if (currentTask) {
            await currentTask();
        }

        this.isProcessing = false;
        this.processNext(); // Move to the next item
    }

    get length(): number {
        return this.queue.length;
    }
}

export const memoryQueue = new MemoryQueue();