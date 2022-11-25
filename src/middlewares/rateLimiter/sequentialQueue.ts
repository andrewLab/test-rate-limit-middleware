type Executor = () => Promise<unknown>

export class SequentialQueue {
    private stack: Executor[] = [];
    private isRunning = false;

    push(fn: Executor) {
        this.stack.push(fn)
        if (!this.isRunning) {
            this.isRunning = true;
            this.next();
        }
    }

    next() {
        if (!this.stack.length) {
            return this.stop();
        }
        const job = this.stack.shift()
        if (!job) {
            return this.stop();
        }
        job().then(() => {
            this.next()
        })
    }

    stop() {
        this.isRunning = false
        return;
    }
}