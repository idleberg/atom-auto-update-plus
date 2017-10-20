meta = require ("../package.json")

module.exports =
  getConfig: (key = "") ->
    if key?
      return atom.config.get "#{meta.name}.#{key}"

    return atom.config.get "#{meta.name}"

  notification: (string, notification) ->
    switch @getConfig("notificationStyle")
      when "Success" then  atom.notifications.addSuccess(string, notification)
      when "Info" then  atom.notifications.addInfo(string, notification)
      when "Warning" then  atom.notifications.addWarning(string, notification)
      when "Error" then  atom.notifications.addError(string, notification)
      else
        return atom.notifications.addSuccess(string, notification)
