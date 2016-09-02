originalPackageConfig = atom.config.get('auto-update-plus')

window.restoreEnvironment = ->
  atom.config.set('auto-update-plus', originalPackageConfig)
