import { ConfigValues } from 'atom';
import { name }from '../package.json';
import Logger from './log';

const TIME_IN_MINUTES = {
  six_hours: 360,
  one_minute: 1,
  five_minutes: 5,
  fifteen_minutes: 15,
  one_week: 10080
};

const configSchema = {
  includedPackages: {
    title: 'Included Packages',
    description: 'Comma-delimited list of packages to be included from automatic updates. Don\'t mix with *Excluded Packages* – included packages take precedence over excluded packages.',
    type: 'array',
    default: [],
    order: 1
  },
  excludedPackages: {
    title: 'Excluded Packages',
    description: 'Comma-delimited list of packages to be excluded from automatic updates. Don\'t mix with *Included Packages* – included packages take precedence over excluded packages.',
    type: 'array',
    default: [],
    order: 2
  },
  versionRange: {
    title: 'Version Range',
    description: 'Specify a [SemVer](https://semver.org/) range that update automatically',
    type: 'array',
    default: ['major', 'minor', 'patch'],
    enum: [
      {
        value: ['patch'],
        description: 'Patch only'
      },
      {
        value: ['minor', 'patch'],
        description: 'Minor or below'
      },
      {
        value: ['major', 'minor', 'patch'],
        description: 'Major or below (all versions)'
      },
      {
        value: ['major', 'minor'],
        description: '⚠️ Minor or above'
      },
      {
        value: ['major'],
        description: '⚠️ Major only'
      },
    ],
    order: 2
  },
  updateInterval: {
    title: 'Update Interval',
    description: 'Set the default interval between updates, in minutes',
    type: 'integer',
    minimum: atom.inDevMode() ? 1 : TIME_IN_MINUTES.fifteen_minutes,
    maximum: TIME_IN_MINUTES.one_week,
    default: TIME_IN_MINUTES.six_hours,
    order: 3
  },
  pollingInterval: {
    title: 'Polling Interval',
    description: 'Set the polling interval for update checks, in minutes',
    type: 'integer',
    minimum: TIME_IN_MINUTES.one_minute,
    maximum: TIME_IN_MINUTES.five_minutes,
    default: TIME_IN_MINUTES.one_minute,
    order: 4
  },
  deferInitialization: {
    title: 'Defer Initialization',
    description: 'Set the default timeout for update initialization, in seconds',
    type: 'integer',
    minimum: atom.inDevMode() ? 1 : 5,
    maximum: 120,
    default: 10,
    order: 5
  },
  hideUpdateStatusView: {
    title: 'Hide Update Status',
    description: 'Hides Atom\'s default update indicator in the status bar',
    type: 'boolean',
    default: false,
    order: 6,
  },
  notifications: {
    title: 'Notifications',
    type: 'object',
    order: 7,
    properties: {
      notifyOnUpdate: {
        title: 'Notify on Update',
        description: 'Enable to show notifications when packages have been updated',
        type: 'boolean',
        default: true,
        order: 1
      },
      dismissNotification: {
        title: 'Dismiss Notification',
        description: 'Automatically dismiss the update notification after 5 seconds',
        type: 'boolean',
        default: true,
        order: 2
      },
      maximumPackageDetail: {
        title: 'Maximum Package Detail',
        description: 'Specify the maximum number of package names displayed in the notification (minimum is 3)',
        type: 'integer',
        default: 5,
        minimum: 3,
        maximum: 20,
        order: 3
      }
    }
  }
};

function getConfig(key = ''): ConfigValues {
  return key?.length
    ? atom.config.get(`${name}.${key}`)
    : atom.config.get(`${name}`);
}

function migrateConfig(oldKey: string, newKey: string): void {
  if (!atom.config.get(`${name}.${oldKey}`) || atom.config.get(`${name}.${newKey}`)) {
    Logger.warn(`The configuration setting '${newKey}' already exists, skipping migration`);
    return;
  }

  try {
    atom.config.set(`${name}.${newKey}`, atom.config.get(`${name}.${oldKey}`));
  } catch (error) {
    Logger.error(error);
    atom.notifications.addWarning(`Failed to migrate configuration, see console for details`);

    return;
  }

  Logger.warn(`The configuration setting '${oldKey}' was migrated successfully to '${newKey}'`);
  atom.config.unset(`${name}.${oldKey}`);
}

function unsetConfig(key = ''): void {
  const unsetKey = key?.length
    ? `${name}.${key}`
    : name;

    Logger.log(`Unsetting configuration setting '${unsetKey}`);
    atom.config.unset(unsetKey);
}

export {
  configSchema,
  getConfig,
  migrateConfig,
  unsetConfig
};
