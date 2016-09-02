# auto-update-plus

[![apm](https://img.shields.io/apm/l/auto-update-plus.svg?style=flat-square)](https://atom.io/packages/auto-update-plus)
[![apm](https://img.shields.io/apm/v/auto-update-plus.svg?style=flat-square)](https://atom.io/packages/auto-update-plus)
[![apm](https://img.shields.io/apm/dm/auto-update-plus.svg?style=flat-square)](https://atom.io/packages/auto-update-plus)
[![Travis](https://img.shields.io/travis/idleberg/atom-auto-update-plus.svg?style=flat-square)](https://travis-ci.org/idleberg/atom-auto-update-plus)
[![David](https://img.shields.io/david/dev/idleberg/atom-auto-update-plus.svg?style=flat-square)](https://david-dm.org/idleberg/atom-auto-update-plus#info=devDependencies)

Keeps your Atom packages up to date.

This package is a fork of [auto-update-packages](https://github.com/yujinakayama/atom-auto-update-packages), the key differences are the following:

* uses OS-independent Atom notications
* uses localStorage for settings
* allows to include/exclude specific packages

## Installation

Install `auto-update-plus` from Atom's [Package Manager](http://flight-manual.atom.io/using-atom/sections/atom-packages/) or the command-line equivalent:

`$ apm install auto-update-plus`

### GitHub

Change to your Atom packages directory:

```bash
# Windows
$ cd %USERPROFILE%\.atom\packages

# Linux & macOS
$ cd ~/.atom/packages/
```

Clone the repository as `auto-update-plus`:

```bash
$ git clone https://github.com/idleberg/atom-auto-update-plus auto-update-plus
```

## Usage

This package automatically checks for package updates every 6 hours by default. If any updates are available, it installs them and notifies you.

You can force an update from the Packages menu.

### Settings

You can configure auto-update-packages
either
in the Settings view (**Preferences...** in **Atom** menu)
or
in `~/.atom/config.cson` (**Open Your Config** in **Atom** menu):

### Interval Minutes

* Config Key Path: `auto-update-packages.intervalMinutes`
* Default: 360 minutes (6 hours)
* Minimum: 15 minutes

Specify an auto-update interval.
If you specify a value less than 15, it will be handled as 15 internally.

Note that auto-update-packages does not adhere the value strictly.
It has some margin around 5%.

## License

This work is licensed under the [The MIT License](LICENSE.md).

## Donate

You are welcome support this project using [Flattr](https://flattr.com/submit/auto?user_id=idleberg&url=https://github.com/idleberg/atom-auto-update-plus) or Bitcoin `17CXJuPsmhuTzFV2k4RKYwpEHVjskJktRd`
