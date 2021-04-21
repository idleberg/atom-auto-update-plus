import { Disposable } from 'atom';
import Logger from './log';

export default {
  busySignal: null,
  serviceName: 'busy-signal',

  // eslint-disable-next-line
  consumer(registry: any): Disposable {
    this.busySignal = registry.create();

    return new Disposable(() => {
      this.busySignal = null;
    });
  },

  add(message: string): void {
    try {
      this.busySignal.add(message);
    } catch (error) {
      Logger.log('Busy Signal has failed', error);
    }
  },

  remove(message = ''): void {
    try {
      this.busySignal.remove(message);
    } catch (error) {
      Logger.log('Busy Signal has failed', error);
    }
  },

  clear(): void {
    try {
      this.busySignal.clear();
    } catch (error) {
      Logger.log('Busy Signal has failed', error);
    }
  },

  dispose(): void {
    try {
      this.busySignal.dispose();
    } catch (error) {
      Logger.log('Busy Signal has failed', error);
    }
  }
};
