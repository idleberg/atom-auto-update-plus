meta = require ("../package.json")

module.exports =
  getConfig: (key = "") ->
    if key?
      return atom.config.get "#{meta.name}.#{key}"

    return atom.config.get "#{meta.name}"
