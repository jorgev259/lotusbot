var util = require('../../utilities.js')
var cooldown = {}

module.exports = {
  async reqs (client, db) {
    await db.run(`CREATE TABLE IF NOT EXISTS exp (id TEXT, color TEXT, exp, lastDaily TEXT, lvl INT, money INT, rank INT, bg TEXT, prestige INT, UNIQUE(id));`)
    await db.run(`CREATE TABLE IF NOT EXISTS nicks (id TEXT, nick TEXT, UNIQUE(id));`)
    await db.run(`CREATE TABLE IF NOT EXISTS inventory (id TEXT, type TEXT, item TEXT);`)
    await db.run(`CREATE TABLE IF NOT EXISTS badges (id TEXT, number INTEGER, item TEXT);`)
  },

  events: {
    async guildMemberUpdate (client, db, oldMember, newMember) {
      if (oldMember.nickname != newMember.nickname) {
        db.run('INSERT OR REPLACE INTO nicks (id,nick) VALUES (?,?)', [newMember.id, newMember.nickname])
      }
    },

    async message (client, db, message) {
      exp(message, client, db)
    }
  }
}

async function exp (msg, client, db) {
  await util.userCheck(msg.author.id, client, db)
  if (cooldown[msg.author.id] == undefined && !msg.author.bot && msg.member) { // checks if the user is not on cooldown and filters bots out
    var userInfo = await db.get(`SELECT id,lvl,rank,money,exp,color,prestige FROM exp WHERE id = ${msg.author.id}`)

    // adds random amount (15-25) of exp to the user
    var randomExp = Math.floor(Math.random() * ((25 - 15) + 1) + 15)
    userInfo.exp += randomExp
    await db.run(`UPDATE exp SET exp = ${userInfo.exp} WHERE id = ${msg.author.id}`)

    if (userInfo.exp > client.data.levels[userInfo.lvl - 1].exp) { // checks if the user has reached enough exp
      var levelroles = msg.member.roles.filter(r => r.name.includes('[')) // finds all roles that start with [
      await msg.member.roles.remove(levelroles, 'Removed level roles') // removes all lvl roles

      userInfo.lvl += 1
      await db.run(`UPDATE exp SET lvl = ${userInfo.lvl} WHERE id = ${msg.author.id}`)

      await msg.member.roles.add([msg.guild.roles.find(role => role.name == `[${userInfo.lvl}]`)])

      userInfo.money += 2000
      await db.run(`UPDATE exp SET money = ${userInfo.money} WHERE id = ${msg.author.id}`)

      if (client.data.levels[userInfo.lvl].rewards != undefined) {
        client.data.levels[userInfo.lvl].rewards.forEach(async reward => { // checks every reward
          switch (reward.type) {
            case 'role':
              /* {
	  						"type": "role",
								"name": "🍧 - Members",
								"remove":"☕ - Customers"
							} */
              if (!(msg.member.nickname.endsWith('🔰') || msg.member.nickname.endsWith('🍬') || msg.member.nickname.endsWith('🔧') || msg.member.nickname.endsWith('✨') || msg.member.nickname.endsWith('🔖'))) {
                await msg.member.roles.add(msg.guild.roles.find(role => role.name == reward.name), 'Added reward role') // adds the rewarded role
                await msg.member.roles.remove(msg.guild.roles.find(role => role.name == reward.remove), 'Removed old rank')

                var nick = msg.member.nickname
                if (msg.member.nickname.endsWith(reward.remove.split(' ')[0])) {
                  nick = nick.split(reward.remove.split(' ')[0])[0]
                }
                nick += reward.name.split(' ')[0]

                await msg.member.setNickname(nick, 'Changed nickname emoji')
              }
              break

            case 'rankUP':
              /* {
								"type": "rankUP"
							} */

              let rank = userInfo.rank
              let color = userInfo.color
              let oldRoles = [client.data.colorRoles[color][rank]]
              let newRoles = [client.data.colorRoles[color][rank + 1]]

              await msg.member.roles.remove(oldRoles)
              await msg.member.roles.add(newRoles)

              if (!(msg.member.nickname.endsWith('🔰') || msg.member.nickname.endsWith('🍬') || msg.member.nickname.endsWith('🔧') || msg.member.nickname.endsWith('✨') || msg.member.nickname.endsWith('🧣') || msg.member.nickname.endsWith('🎬') || msg.member.nickname.endsWith('💎'))) {
                var nick = msg.member.nickname.split(' ')
                nick[nick.length - 1] = client.guilds.get('289758148175200257').roles.get(newRoles[0]).name.split(' ')[0]
                msg.member.setNickname(nick.join(' '), 'Changed nickname emoji')
              }

              await db.run(`UPDATE exp SET rank = ${userInfo.rank + 1} WHERE id = ${msg.author.id}`)
              break
          }
        })
      }

      if (userInfo.lvl > 35) {
        await db.run(`UPDATE exp SET rank = 0, lvl = 0, exp = 0, prestige = ${userInfo.prestige + 1} WHERE id = ${msg.author.id}`)
        let rank = userInfo.rank
        let color = userInfo.color
        let oldRoles = [client.data.colorRoles[color][rank]]
        let newRoles = [client.data.colorRoles[color][0]]

        await msg.member.roles.remove(oldRoles)
        await msg.member.roles.add(newRoles)
        await msg.member.roles.remove(msg.member.roles.filter(role => role.name.startsWith('[')))
      }
    }

    cooldown[msg.author.id] = true // sets the user on cooldown and will remove it in 60000 ms (1 minute)
    setTimeout(function (authorID) {
      delete cooldown[authorID]
    }, 90000, msg.author.id)
  }
}
