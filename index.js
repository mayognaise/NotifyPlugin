/* eslint no-console: 0 */
'use strict'

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
}

const exec = require('child_process').exec

class NotifyPlugin {
  constructor (name) {
    this.name = name
  }

  apply (compiler) {
    compiler.plugin('done', function (stats) {
      this.onBuildComplete(stats)
    }.bind(this))
  }

  /**
   * Send a system notification. Only works on OSX for now.
   */
  sendNotification (success, message) {
    let sound
    let title

    if (success) {
      sound = 'Pop'
      title = `😄 Success! (${this.name})`
    } else {
      sound = 'Basso'
      title = `😨 Error (${this.name})`
    }

    const appleScript = `display notification "${message}" with title "${title}" sound name "${sound}"`
    exec(`osascript -e '${appleScript}'`)
  }

  onBuildComplete (stats) {
    const data = stats.toJson()

    let took = stats.endTime - stats.startTime
    if (took > 1000) {
      took = (took / 1000.0).toFixed(1) + 's'
    } else {
      took = took + 'ms'
    }

    if (data.errors && data.errors.length > 0) {
      const log = `✘ Build failed with ${data.errors.length} errors`
      this.sendNotification(false, log)
      console.log(COLORS.red, `${log} in ${took}`, COLORS.reset)
    } else {
      this.sendNotification(true, `✓ Build succeeded in ${took}!`)
      console.log(COLORS.green, `✓ Compiled ${data.chunks.length} chunks from ${data.modules.length} modules in ${took}`, COLORS.reset)
    }
  }
}

module.exports = NotifyPlugin
