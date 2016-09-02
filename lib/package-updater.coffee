meta = require '../package.json'
{BufferedProcess} = require 'atom'

ATOM_BUNDLE_IDENTIFIER = 'com.github.atom'
INSTALLATION_LINE_PATTERN = /^Installing +([^@]+)@(\S+).+\s+(\S+)$/

module.exports =

  updatePackages: (isAutoUpdate = true) ->
    @runApmUpgrade (log) =>
      entries = @parseLog(log)
      summary = @generateSummary(entries, isAutoUpdate)
      return unless summary
      @notify
        title: 'Atom Package Updates'
        message: summary
        sender: ATOM_BUNDLE_IDENTIFIER
        activate: ATOM_BUNDLE_IDENTIFIER

  runApmUpgrade: (callback) ->
    command = atom.packages.getApmPath()

    availablePackages = atom.packages.getAvailablePackageNames()
    includedPackages = atom.config.get("#{meta.name}.includedPackages")
    excludedPackages = atom.config.get("#{meta.name}.excludedPackages")

    args = ["upgrade"]
    
    if includedPackages.length > 0
      console.log "Updated included packages"
      for includedPackage in includedPackages
        args.push includedPackage
    else if excludedPackages.length > 0
      console.log "Updated excluded packages"
      for excludedPackage in excludedPackages

        if excludedPackage in availablePackages
          index = availablePackages.indexOf excludedPackage
          availablePackages.splice index, 1 if index
      for availablePackage in availablePackages
        args.push availablePackage

    args.push "--no-confirm"
    args.push "--no-color"

    console.log "args: #{args}"

    log = ''

    stdout = (data) ->
      log += data

    exit = (exitCode) ->
      callback(log)

    console.log command, args
    new BufferedProcess({command, args, stdout, exit})

  # Parsing the output of apm is a dirty way, but using atom-package-manager directly via JavaScript
  # is probably more brittle than parsing the output since it's a private package.
  # /Applications/Atom.app/Contents/Resources/app/apm/node_modules/atom-package-manager
  parseLog: (log) ->
    lines = log.split('\n')

    for line in lines
      matches = line.match(INSTALLATION_LINE_PATTERN)
      continue unless matches?
      [_match, name, version, result] = matches

      'name': name
      'version': version
      'isInstalled': result == '\u2713'

  generateSummary: (entries, isAutoUpdate = true) ->
    successfulEntries = entries.filter (entry) ->
      entry.isInstalled
    return null unless successfulEntries.length > 0

    names = successfulEntries.map (entry) ->
      entry.name

    summary =
      if successfulEntries.length <= 5
        @generateEnumerationExpression(names)
      else
        "#{successfulEntries.length} packages"

    summary += if successfulEntries.length == 1 then ' has' else ' have'
    summary += ' been updated'
    summary += ' automatically' if isAutoUpdate
    summary += '.'
    summary

  generateEnumerationExpression: (items) ->
    expression = ''

    for item, index in items
      if index > 0
        if index + 1 < items.length
          expression += ', '
        else
          expression += ' and '

      expression += item

    expression

  notify: (notification) ->
    args = []
    console.log "notification #{notification}"
    for key, value of notification
      console.log "#{key}: #{value}"
      args.push("-#{key}", value)

    if atom.config.get("#{meta.name}.isVerbose")
      atom.notifications.addSuccess(meta.name, detail: notification.message, dismissable: true)
