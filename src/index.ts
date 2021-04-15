import meta from '../package.json';
import { CompositeDisposable } from 'atom';
import { configSchema, getConfig, migrateConfig, unsetConfig } from './config';
import { initUpdate, hideStatusBar, observeConflictingSettings } from './util';
import Logger from './log';

const PackageControl = {
  config: configSchema,
  subscriptions: new CompositeDisposable(),

  activate(): void {
    Logger.log('Activating package');

    this.subscriptions.add(
      atom.config.observe(`${meta.name}.includedPackages`, observeConflictingSettings),
      atom.config.observe(`${meta.name}.excludedPackages`, observeConflictingSettings),
      atom.config.observe(`${meta.name}.hideUpdateStatusView`, hideStatusBar)
    );

    // Migrate from v0.5
    this.migrate();

    // Defer
    const config = getConfig();
    Logger.log(`Defering initialization by ${config.deferInitialization} seconds`);

    setTimeout(async () => {
      await initUpdate();
    }, config.deferInitialization * 1000);
  },

  migrate(): void {
    migrateConfig('dismissNotification', 'notifications.dismissNotification');
    migrateConfig('maximumPackageDetail', 'notifications.maximumPackageDetail');
    migrateConfig('updateNotification', 'notifications.notifyOnUpdate');
    unsetConfig('notificationStyle');
  },

  deactivate(): void {
    Logger.log('Deactivating package');

    this.subscriptions?.dispose();
  }
};

export default PackageControl;
