import { getConfig } from './config';
import execa from 'execa';
import Logger from './log';
import meta from '../package.json';
import semverDiff from 'semver-diff';
import Signal from './busy-signal';

// TODO: Remove in future version
import 'core-js/modules/es.promise.all-settled'

const execaOptions = {
  timeout: 5 * 1000 * 60
};

function hideStatusBar(state: boolean): void {
  Logger.log(state ? 'Hiding update indicator' : 'Showing update indicator');

  if (!document.querySelector(`style#${meta.name}`)) {
    document.head.insertAdjacentHTML('beforeend', `<style id="${meta.name}"></style>`);
  }

  const styleTag = document.querySelector(`style#${meta.name}`);

  styleTag.textContent = `
    .package-updates-status-view {
      display: ${state ? 'none !important;' : 'inline'}
     }
  `;
}

async function prepareUpdate(forceUpdate = false): Promise<void> {
  if (!forceUpdate && !updateIsDue()) return;

  const message = 'Checking for updates';
  Signal.add(message);

  let outdatedPackages;

  try {
    outdatedPackages = await getOutdatedPackages();
  } catch (err) {
    Signal.remove(message);
    atom.notifications.addError('Could not retrieve outdated packages, see the console for details');
    return;
  }

  if (!outdatedPackages.length) {
    Logger.log('No outdated packages found');
    setLastUpdate();
    Signal.remove(message);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedPackages = await (Promise as any).allSettled(
    outdatedPackages.map(async packageName => await updatePackage(packageName))
  );

  notifyUser(updatedPackages.filter(item => item).map(item => item.value));
  setLastUpdate();
  Signal.remove(message);
}

function getLastUpdate(): number {
  const lastUpdateTime = localStorage.getItem(`${meta.name}.lastUpdateTime`);

  return lastUpdateTime
    ? Math.floor(new Date(lastUpdateTime).getTime() / 1000)
    : 0;
}

function setLastUpdate(): void {
  const now = new Date().toISOString();
  Logger.log('Setting lastUpdateTime to', now);
  localStorage.setItem(`${meta.name}.lastUpdateTime`, now);
}

function updateIsDue(): boolean {
  const now = Math.floor(new Date().getTime() / 1000);
  const lastUpdate = getLastUpdate();
  const intervalSeconds = Number(getConfig('updateInterval')) * 60;
  const lastUpdateInterval = now - lastUpdate;

  if (intervalSeconds >= lastUpdateInterval) {
    Logger.log(`The next update is due in ${Math.round((intervalSeconds - lastUpdateInterval) / 60)} minutes`);
    return false;
  }

  Logger.log('The next update is due now');
  return true;
}

async function updatePackage(packageName: string): Promise<string> {
  const apmPath = atom.packages.getApmPath();

  try {
    Logger.log(`Updating '${packageName}'${packageName === meta.name ? ', hey that\'s me!' : ''}`);
    await execa(apmPath, ['update', packageName, '--no-confirm'], execaOptions);
  } catch (err) {
    const errorMessage = `Failed to install '${packageName}'`;
    Logger.error(errorMessage);
    throw Error(errorMessage);
  }

  return packageName;
}

function notifyUser(packageNames) {
  const { notifications } = getConfig();

  if (!notifications.notifyOnUpdate) return;

  const message = [
    'Automatically updated'
  ];

  const spelledOutPackages = packageNames.slice(0, notifications.maximumPackageDetail).map(item => `**${item}**`);
  const remainingPackages = packageNames.slice(notifications.maximumPackageDetail);

  if (packageNames.length > notifications.maximumPackageDetail && remainingPackages.length) {
    spelledOutPackages.push(`${remainingPackages.length} other ${remainingPackages.length > 1 ? 'packages' : 'package'}`)
  }

  message.push(generateEnumerationExpression(spelledOutPackages));

  const notification = atom.notifications.addSuccess(message.join(' '), {
    dismissable: !notifications.dismissNotification,
    buttons: !notifications.dismissNotification && [
      {
        text: 'Restart',
        async onDidClick() {
          notification.dismiss();

          await atom.restartApplication();

          return;
        }
      },
      {
        text: 'Cancel',
        onDidClick() {
          notification.dismiss();

          return;
        }
      }
    ]
  });
}

function generateEnumerationExpression(items: string[]): string {
  let expression = '';
  const result = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (index > 0) {
      expression += (index + 1) < items.length
        ? ', '
        : ' and ';
    }

    result.push(expression += item);
  }

  return expression;
}

async function getOutdatedPackages(): Promise<string[]> {
  Logger.log('Retrieving outdated packages')

  const apmPath: string = atom.packages.getApmPath();
  let response;

  try {
    response = await execa(apmPath, ['update', '--compatible', '--json', '--list'], execaOptions);
  } catch (err) {
    throw Error(err.message);
  }

  let outdatedPackages = JSON
    .parse(response.stdout)
    .map(({name, version, latestVersion}) => {
      return {
        name,
        version,
        latestVersion,
      };
    })
    .filter(item => isInRange(item)) || [];

  const { includedPackages, excludedPackages } = getConfig();

  if (includedPackages.length) {
    Logger.log(`Including packages for update: ${generateEnumerationExpression(includedPackages)}`)
    outdatedPackages = outdatedPackages.filter(item => includedPackages.includes(item.name));
  } else if (excludedPackages.length) {
    Logger.log(`Excluding packages from update: ${generateEnumerationExpression(excludedPackages)}`)
    outdatedPackages = outdatedPackages.filter(item => !excludedPackages.includes(item.name));
  }

  return outdatedPackages.map(item => item.name);
}

function isInRange(item) {
  const versionRange = getConfig('versionRange');

  return versionRange.includes(semverDiff(item.version, item.latestVersion));
}

function observeConflictingSettings(): void {
  const { includedPackages, excludedPackages } = getConfig();

  if (includedPackages.length && excludedPackages.length) {
    atom.notifications.addWarning('The `includedPackages` and `excludedPackages` settings are in conflict, you can only use one of them.', {
      dismissable: true
    });
  }
}

export {
  hideStatusBar,
  getOutdatedPackages,
  observeConflictingSettings,
  prepareUpdate,
  updateIsDue
};
