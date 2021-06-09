# auto-update-plus

> Keeps your Atom packages up to date.

[![apm](https://flat.badgen.net/apm/license/auto-update-plus)](https://atom.io/packages/auto-update-plus)
[![apm](https://flat.badgen.net/apm/v/auto-update-plus)](https://atom.io/packages/auto-update-plus)
[![apm](https://flat.badgen.net/apm/dl/auto-update-plus)](https://atom.io/packages/auto-update-plus)
[![CircleCI](https://flat.badgen.net/circleci/github/idleberg/atom-auto-update-plus)](https://circleci.com/gh/idleberg/atom-auto-update-plus)
[![David](https://flat.badgen.net/david/dev/idleberg/atom-auto-update-plus)](https://david-dm.org/idleberg/atom-auto-update-plus?type=dev)

This package is a fork of [auto-update-packages](https://github.com/yujinakayama/atom-auto-update-packages), but differing in some key-aspects:

- OS-independent Atom notifications
- inclusion/exclusion of specific packages
- updates specific [SemVer][sem-ver] ranges
- runs updates concurrently

## Installation

### apm

Install `auto-update-plus` from Atom [install view](atom://settings-view/show-package?package=auto-update-plus) or use the command-line equivalent:

`$ apm install auto-update-plus`

### Using Git

Change to your Atom packages directory:

**Windows**

```powershell
# Powershell
$ cd $Env:USERPROFILE\.atom\packages
```

```cmd
:: Command Prompt
$ cd %USERPROFILE%\.atom\packages
```

**Linux & macOS**

```bash
$ cd ~/.atom/packages/
```

Clone the repository as `auto-update-plus`:

```bash
$ git clone https://github.com/idleberg/atom-auto-update-plus auto-update-plus
```

Install dependencies:

```bash
cd auto-update-plus && npm install
```

## Usage

Just sit tight :sunglasses:

As the name implies, this package runs _automatically_ every 6 hours. If any updates are available, they will be installed in the background and you will be notified about successful updates.

All of the defaults, such as update intervals or notificaiton messages, can be tweaked in the [package settings][package-settings]. Furthermore, you include or exclude specific packages from updating, or define a [Semantic Versioning][sem-ver] range that needs to be met.

If you're impatient, you can force an update check by running _Auto Update Plus: Update Now_ from the [command palette][command-palette] or the Packages menu.

## License

This work is licensed under the [MIT License](LICENSE)

[command-palette]: https://flight-manual.atom.io/getting-started/sections/atom-basics/#command-palette
[package-settings]: https://flight-manual.atom.io/using-atom/sections/atom-packages/#package-settings
[sem-ver]: https://semver.org/
