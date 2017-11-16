meta = require "../package.json"
Util = require "./util"
{BufferedProcess} = require "atom"

ATOM_BUNDLE_IDENTIFIER = "com.github.atom"
INSTALLATION_LINE_PATTERN = /^Installing +([^@]+)@(\S+).+\s+(\S+)$/

module.exports =
  updatePackages: (isAutoUpdate = true) ->
    @runApmUpgrade (log) =>
      entries = @parseLog(log)
      summary = @generateSummary(entries, isAutoUpdate)

      updateWording = if isAutoUpdate is true then "Auto-updating" else "Updating"
      packageWording =if entries.length is 1 then "package" else "packages"

      if entries.length > 0
        require("./ga").sendEvent "package-updater", "#{updateWording} #{entries.length} #{packageWording} (Atom v#{atom.appVersion} #{atom.getReleaseChannel()})"
        console.log("#{updateWording} #{entries.length} #{packageWording}") if Util.getConfig("debugMode")

      return unless summary
      @notify
        title: "Atom Package Updates"
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
      console.log "Packages included in update:" if Util.getConfig("debugMode")

      for includedPackage in includedPackages
        console.log "- #{includedPackage}" if Util.getConfig("debugMode")
        args.push includedPackage

    else if excludedPackages.length > 0
      console.log "Packages excluded from update:" if Util.getConfig("debugMode")

      for excludedPackage in excludedPackages
        if excludedPackage in availablePackages
          console.log "- #{excludedPackage}" if Util.getConfig("debugMode")
          index = availablePackages.indexOf excludedPackage
          availablePackages.splice index, 1 if index

    else
      for availablePackage in availablePackages
        args.push availablePackage

    args.push "--no-confirm"
    args.push "--no-color"

    log = ""

    stdout = (data) ->
      log += data

    exit = (exitCode) ->
      callback(log)

    new BufferedProcess({command, args, stdout, exit})

  # Parsing the output of apm is a dirty way, but using atom-package-manager directly via JavaScript
  # is probably more brittle than parsing the output since it"s a private package.
  # /Applications/Atom.app/Contents/Resources/app/apm/node_modules/atom-package-manager
  parseLog: (log) ->
    lines = log.split("\n")

    for line in lines
      matches = line.match(INSTALLATION_LINE_PATTERN)
      continue unless matches?
      [_match, name, version, result] = matches

      "name": name
      "version": version
      "isInstalled": result == "\u2713"

  generateSummary: (entries, isAutoUpdate = true) ->
    successfulEntries = entries.filter (entry) ->
      entry.isInstalled
    return null unless successfulEntries.length > 0

    names = successfulEntries.map (entry) ->
      entry.name

    summary =
      if successfulEntries.length <= atom.config.get("#{meta.name}.maximumPackageDetail")
        @generateEnumerationExpression(names)
      else
        "#{successfulEntries.length} packages"

    summary += if successfulEntries.length == 1 then " has" else " have"
    summary += " been updated"
    summary += " automatically" if isAutoUpdate
    summary += "."
    summary

  generateEnumerationExpression: (items) ->
    expression = ""

    for item, index in items
      if index > 0
        if index + 1 < items.length
          expression += ", "
        else
          expression += " and "

      expression += item

    expression

  notify: (notification) ->
    if atom.config.get("#{meta.name}.updateNotification")
      require("./ga").sendEvent "package-updater", "Show Notification"
      console.log("Show Notification") if Util.getConfig("debugMode")

      notifyOptions = {
        detail: notification.message
        dismissable: !atom.config.get("#{meta.name}.dismissNotification")
        buttons: [
            {
            text: "Restart"
            className: "icon icon-sync"
            onDidClick: ->
              require("./ga").sendEvent "package-updater", "Restart Application"
              console.log("Restart Application") if Util.getConfig("debugMode")

              atom.restartApplication()
          }
        ]
      }

      Util.notification("**#{meta.name}**", notifyOptions)
