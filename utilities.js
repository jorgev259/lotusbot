var reactions = ['390223211662540800', '390223209930424321', '390223211637243905', '390223211616534577', '390223211456888835', '390223210240540683']
var colors = ['pink', 'd-blue', 'purple', 'l-blue', 'green', 'red', 'yellow']
const Discord = require('discord.js')

var random = require('random-number-csprng')
var fs = require('fs-extra')

module.exports = {
  async permCheck (message, commandName, client, db) {
    let dbPerms = db.prepare('SELECT type,perm FROM perms WHERE command=? AND guild=?').all(commandName, message.guild.id)
    if (dbPerms.length === 0) return true
    let perms = {role: [], user: [], channel: []}
    dbPerms.forEach(element => {
      perms[element.type].push(element.perm)
    })

    if (perms.channel.length === 0 || perms.channel.includes(message.channel.name)) {
      if (perms.role.length > 0 && message.member.roles.some(r => perms.role.includes(r.name))) return true

      if (perms.user.length > 0 && perms.user.includes(message.author.id)) return true
    }

    return false
  },

  async userCheck (id, client, db) {
    let guild = client.guilds.get('289758148175200257')
    if (!guild) return
    let member = await guild.members.fetch(id)
    if (member.user.bot) return

    await db.run('INSERT OR IGNORE INTO exp (id,color,rank,lvl,exp,money,lastDaily,bg,prestige) VALUES (?, ?, 0, 1, 0, 0, ?, ?, 0)', [member.id, colors[await random(0, colors.length - 1)], 'Not Collected', 'DEFAULT'])
    const userInfo = await db.get(`SELECT lvl,color,rank FROM exp WHERE id = ${member.id}`)

    let allRoles = ['436590073568559104', '441580169258598401', '436590072939282432', '435805052259794944', '435801059361947648', '435805052259794944', '435803522659778562']
    var rankRoles = member.roles.filter(role => role.name.startsWith('[') && role.name.endsWith(']'))
    if (rankRoles.size > 1) await member.roles.remove(rankRoles)

    allRoles.push(client.guilds.get('289758148175200257').roles.find(role => role.name === `[${userInfo.lvl}]`).id, client.data.colorRoles[userInfo.color][userInfo.rank], client.data.groupRoles[userInfo.color])
    let roles = allRoles.filter(id => !member.roles.has(id))
    await member.roles.add(roles, 'User join')
  },

  async checkData (client, name, info) {
    if (!(await fs.pathExists(`data/${name}.json`))) {
      // file does not exist
      client.data[name] = info
      fs.writeFileSync(`data/${name}.json`, JSON.stringify(client.data[name], null, 4))
    }
  },

  async save (data, name) {
    await fs.writeFile('data/' + name + '.json', JSON.stringify(data, null, 4))
  },

  log: function (client, log) {
    console.log(log)
    if (client != null && client.channels.size > 0 && client.readyAt != null) {
      client.channels.get('486742594030796800').send({embed: new Discord.MessageEmbed().setTimestamp().setDescription(log)})
    }
  }
}
