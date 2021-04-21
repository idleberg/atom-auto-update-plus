import meta from '../package.json';
import { CompositeDisposable } from 'atom';
import { configSchema, getConfig, migrateConfig, unsetConfig } from './config';
import { prepareUpdate, hideStatusBar, observeConflictingSettings, updateIsDue } from './util';
import Logger from './log';
import Signal from './busy-signal';

const AutoUpdatePlus = {
  config: configSchema,
  configSubscription: null,
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
      atom.config.observe(`${meta.name}.hideUpdateStatusView`, hideStatusBar)
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
    const pollingInterval = getConfig('pollingInterval');
    Logger.log(`Setting polling interval to ${pollingInterval} seconds`);

    this.updateInterval = setInterval(async () => {
      await prepareUpdate();
    }, Number(pollingInterval) * 1000);

    this.configSubscription = atom.config.onDidChange(`${meta.name}.updateInterval`, ({newValue})=> {
      Logger.log(`Changed update interval to ${newValue} minutes`, newValue);

      this.disableUpdateInterval();
      this.enableUpdateInterval();
    });
  },

  disableUpdateInterval(): void{
    this.configSubscription?.dispose();
    this.configSubscription = null;

    if (this.updateInterval) {
      Logger.log('Clearing interval');
      clearInterval(this.updateInterval);
    }

    this.updateInterval = null;
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
