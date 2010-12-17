#!/usr/bin/env node
;(function () { // wrapper in case we're in module_context mode
var log = require("./lib/utils/log")
log.waitForConfig()
log.info("ok", "it worked if it ends with")

var fs = require("./lib/utils/graceful-fs")
  , path = require("path")
  , sys = require("./lib/utils/sys")
  , npm = require("./npm")
  , ini = require("./lib/utils/ini")
  , rm = require("./lib/utils/rm-rf")
  , errorHandler = require("./lib/utils/error-handler")

  , argv = process.argv.slice(2)
  , parseArgs = require("./lib/utils/parse-args")

log.verbose(argv, "cli")

var conf = parseArgs(argv)
npm.argv = conf.argv.remain
if (-1 !== npm.fullList.indexOf(npm.argv[0])) {
  npm.command = npm.argv.shift()
}


if (conf.version) {
  console.log(npm.version)
  return
} else log("npm@"+npm.version, "using")
log("node@"+process.version, "using")

// make sure that this version of node works with this version of npm.
var semver = require("./lib/utils/semver")
  , nodeVer = process.version
  , reqVer = npm.nodeVersionRequired
if (reqVer && !semver.satisfies(nodeVer, reqVer)) {
  return errorHandler(new Error(
    "npm doesn't work with node " + nodeVer
    + "\nRequired: node@" + reqVer), true)
}

process.on("uncaughtException", errorHandler)

if (conf.usage && npm.command && npm.command !== "help") {
  npm.argv.unshift(npm.command)
  npm.command = "help"
}

// now actually fire up npm and run the command.
// this is how to use npm programmatically:
conf._exit = true
npm.load(conf, function (er) {
  if (er) return errorHandler(er)
  npm.commands[npm.command](npm.argv, errorHandler)
})
})()
