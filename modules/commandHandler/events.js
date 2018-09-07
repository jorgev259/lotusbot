var util = require('../../utilities.js')

module.exports = {
  events: {
    async message (client, db, message) {
      if (!message.member) return
      var prefix = '>'

      if (message.content.startsWith(prefix) || message.content.startsWith('<@' + client.user.id + '>')) {
        var param = message.content.split(' ')

        if (message.content.startsWith(prefix)) {
          param[0] = param[0].split(prefix)[1]
        } else {
          param.splice(0, 1)
        }

        const commandName = param[0].toLowerCase()
        var command = db.prepare('SELECT * FROM customs WHERE guild=? AND name=?').get(message.guild.id, commandName)
        if (await util.permCheck(message, commandName, client, db)) {
          if (command === undefined) { command = {}; command.type = param[0].toLowerCase() };
          if (!client.commands.has(command.type)) return
          client.commands.get(command.type).execute(client, message, param, db)
        }
      }
    }
  }
}
