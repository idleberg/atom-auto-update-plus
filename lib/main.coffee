meta = require ("../package.json")
PackageUpdater = null

WARMUP_WAIT = 10 * 1000
MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES = 15

module.exports =
  config:
    includedPackages:
      title: "Included Packages"
      description: "Comma-delimited list of packages to be included from automatic updates"
      type: "array"
      default: []
      order: 1
    excludedPackages:
      title: "Excluded Packages"
      description: "Comma-delimited list of packages to be excluded from automatic updates"
      type: "array"
      default: []
      order: 2
    intervalMinutes:
      title: 'Update Interval'
      description: "Set the default update interval in minutes"
      type: 'integer'
      minimum: MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES
      default: 6 * 60
      order: 3
    updateNotification:
      title: "Notify on Update"
      description: "Enable to show notifications when packages have been updated"
      type: "boolean"
      default: true
      order: 4
    dismissNotification:
      title: "Dismiss Notification"
      description: "Automatically dismiss the update notification after 5 seconds"
      type: "boolean"
      default: true
      order: 5

  activate: (state) ->
    commands = {}
    commands["#{meta.name}:update-now"] = => @updatePackages(false)
    @commandSubscription = atom.commands.add('atom-workspace', commands)

    setTimeout =>
      @enableAutoUpdate()
    , WARMUP_WAIT

  deactivate: ->
    @disableAutoUpdate()
    @commandSubscription?.dispose()
    @commandSubscription = null

  enableAutoUpdate: ->
    @updatePackagesIfAutoUpdateBlockIsExpired()

    @autoUpdateCheck = setInterval =>
      @updatePackagesIfAutoUpdateBlockIsExpired()
    , @getAutoUpdateCheckInterval()

    @configSubscription = atom.config.onDidChange "#{meta.name}.intervalMinutes", ({newValue, oldValue}) =>
      console.log "Changed update interval to #{newValue}" if atom.inDevMode()
      @disableAutoUpdate()
      @enableAutoUpdate()

  disableAutoUpdate: ->
    @configSubscription?.dispose()
    @configSubscription = null

    clearInterval(@autoUpdateCheck) if @autoUpdateCheck
    @autoUpdateCheck = null

  updatePackagesIfAutoUpdateBlockIsExpired: ->
    lastUpdateTime = @loadLastUpdateTime() || 0
    if Date.now() > lastUpdateTime + @getAutoUpdateBlockDuration()
      @updatePackages()

  updatePackages: (isAutoUpdate = true) ->
    PackageUpdater ?= require './package-updater'
    PackageUpdater.updatePackages(isAutoUpdate)
    @saveLastUpdateTime()

  getAutoUpdateBlockDuration: ->
    minutes = atom.config.get("#{meta.name}.intervalMinutes")

    if isNaN(minutes) || minutes < MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES
      minutes = MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES

    minutes * 60 * 1000

  getAutoUpdateCheckInterval: ->
    @getAutoUpdateBlockDuration() / 15

  # auto-upgrade-packages runs on each Atom instance,
  # so we need to share the last updated time via a file between the instances.
  loadLastUpdateTime: ->
    try
      lastUpdateTime = localStorage.getItem("#{meta.name}.lastUpdateTime")
      parseInt(lastUpdateTime)
    catch
      null

  saveLastUpdateTime: ->
    localStorage.setItem("#{meta.name}.lastUpdateTime", Date.now().toString())
