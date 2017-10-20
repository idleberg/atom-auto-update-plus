uuid = ->
  s4 = ->
    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring 1

  "#{s4()}#{s4()}-#{s4()}-#{s4()}-#{s4()}-#{s4()}#{s4()}#{s4()}"

module.exports = GoogleAnalytics =
  getCid: (cb) ->
    if @cid
      cb @cid
      return
    require("getmac").getMac (error, macAddress) ->
      if error then cb(@cid = uuid()) else cb(@cid = require("crypto").createHash("sha1").update(macAddress, "utf8").digest("hex"))
    return

  sendEvent: (category, action, label, value) ->
    params =
      t: "event"
      ec: category
      ea: action
    if label
      params.el = label
    if value
      params.ev = value
    @send params
    return

  send: (params) ->
    if !atom.packages.getActivePackage("metrics")
      # If the metrics package is disabled, then user has opted out.
      return
    @getCid (cid) ->
      Object.assign params, { cid: cid }, GoogleAnalytics.defaultParams()
      GoogleAnalytics.request "https://www.google-analytics.com/collect?" + require("querystring").stringify(params)
      return
    return

  request: (url) ->
    if !navigator.onLine
      return
    @post url
    return

  post: (url) ->
    xhr = new XMLHttpRequest
    xhr.open "POST", url
    xhr.send null
    return

  defaultParams: ->
    # https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
    {
      v: 1
      tid: "UA-53539506-18"
    }
