/** * Wrap any promise into a queue of promises which execute one at a time.
 * Returns the result of the given function when it has been resolved.
 * Usage:
 * const someCue = new PromiseCue<MyDataType>();
 * someCue.add<ResultInterface>(() => someAsyncMethod(myArgs)).then((result: ResultInterace) => {
 * DoSomethingWith(result);
 * });
 */

export class PromiseCue<T> {
  private promises: Promise<T>[] = [];

  add(fn: () => Promise<T>): Promise<T> {
    if (!this.promises.length) {
      const orig = fn();
      const promise = this.handleAll(orig);
      this.promises.push(promise);
      return orig;
    }
    const waitPromise = this.handleAll(this.last).then(() => {
      return fn();
    });
    this.promises.push(waitPromise);
    return waitPromise;
  }

  private handleAll(promise: Promise<T>): Promise<T> {
    return new Promise((resolve) => {
      promise.then(() => this.removeFirst() && resolve(null));
      promise.catch(() => this.removeFirst() && resolve(null));
    });
  }

  private removeFirst() {
    this.promises.splice(0, 1);
    return true;
  }

  private get last(): Promise<T> {
    return this.promises[this.promises.length - 1];
  }
}
