import meta from '../package.json';
import { CompositeDisposable } from 'atom';
import { configSchema, getConfig, migrateConfig, unsetConfig } from './config';
import { prepareUpdate, hideStatusBar, observeConflictingSettings, updateIsDue } from './util';
import Logger from './log';
import Signal from './busy-signal';

const AutoUpdatePlus = {
  config: configSchema,
  subscriptions: new CompositeDisposable(),
  updateInterval: null,

  activate(): void {
    Logger.log('Activating package');

    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        'auto-update-plus:update-now': async () => {
          await prepareUpdate(true);
        }
      }),
      atom.config.observe(`${meta.name}.includedPackages`, observeConflictingSettings),
      atom.config.observe(`${meta.name}.excludedPackages`, observeConflictingSettings),
      atom.config.observe(`${meta.name}.hideUpdateStatusView`, hideStatusBar),
      atom.config.onDidChange(`${meta.name}.updateInterval`, ({newValue}) => this.changeInterval('update', newValue)),
      atom.config.onDidChange(`${meta.name}.pollingInterval`, ({newValue}) => this.changeInterval('polling', newValue)),
    );

    // Migrate from v0.5
    this.migrate();

    // Defer
    const config = getConfig();
    Logger.log(`Defering action by ${config.deferInitialization} seconds`);

    setTimeout(async () => {
      await prepareUpdate();

      this.enableUpdateInterval()
    }, config.deferInitialization * 1000);
  },

  migrate(): void {
    migrateConfig('dismissNotification', 'notifications.dismissNotification');
    migrateConfig('maximumPackageDetail', 'notifications.maximumPackageDetail');
    migrateConfig('updateNotification', 'notifications.notifyOnUpdate');
    migrateConfig('intervalMinutes', 'updateInterval');
    unsetConfig('notificationStyle');
  },

  enableUpdateInterval(): void {
    const pollingInterval = Number(getConfig('pollingInterval'));
    Logger.log(`Setting new polling interval to ${pollingInterval} ${pollingInterval === 1 ? 'minute' : 'minutes'}`);

    this.updateInterval = setInterval(async () => {
      await prepareUpdate();
    }, pollingInterval * 60 * 1000);
  },

  clearUpdateInterval(): void {
    if (this.updateInterval) {
      Logger.log('Clearing polling interval');
      clearInterval(this.updateInterval);
    }

    this.updateInterval = null;
  },

  changeInterval(type: string, newValue: number): void {
    Logger.log(`Changed ${type} interval to ${newValue} minutes`);

    this.clearUpdateInterval();
    this.enableUpdateInterval();
  },

  consumeSignal(registry: unknown): void {
    Logger.log('Consuming Busy Signal service');

    Signal.consumer(registry);
  },

  deactivate(): void {
    Logger.log('Deactivating package');

    this.subscriptions?.dispose();
  }
};

export default AutoUpdatePlus;
