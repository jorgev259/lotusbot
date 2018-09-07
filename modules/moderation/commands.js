var util = require('../../utilities.js')
var {MessageEmbed} = require('discord.js')

async function logSend (db, message, send) {
  let {value} = db.prepare('SELECT value FROM config WHERE guild=? AND type=?').get()
  if (value) await message.guild.channels.find(channel => channel.name === value).send(send)
}

module.exports = {
  async reqs (client, db) {
    db.prepare('CREATE TABLE IF NOT EXISTS warns (id INT PRIMARY KEY AUTOINCREMENT, guild TEXT, user TEXT, reason TEXT, issuer TEXT)').run()
  },

  commands: {
    warn: {
      desc: 'This is a description',
      async execute (client, message, param, db) {
        if (!message.mentions.users.size) return message.channel.send('No user was mentioned')
        var issued = message.mentions.members.first()
        let warns = db.prepare('SELECT * FROM warns WHERE guild=? AND user=?').all(message.guild.id, issued.id)

        var warn = {'reason': 'Not defined', 'issuer': message.author.id}
        if (param.length > 2) warn.reason = param.slice(2, param.length).join(' ')
        db.prepare('INSERT INTO warns (guild, user, reason, issuer) VALUES (?,?,?,?)').run(message.guild.id, issued.id, warn.reason, warn.issuer)

        var embed = new MessageEmbed()
          .setColor(message.guild.me.displayColor)
          .setDescription(`${message.author} issued warn #${client.data.warns[issued.id].length} to ${issued}\nReason: ${warn.reason}`)
          .setTimestamp()

        await logSend(db, message, embed)
        await message.channel.send(`${message.author} issued warn #${client.data.warns[issued.id].length} to ${issued}\nReason: ${warn.reason}`)
        if (warns.length >= 3) {
          issued.ban({ reason: warn.reason })
        }
        message.delete()
      }
    },

    removewarn: {
      desc: 'This is a description',
      async execute (client, message, param, db) {
        if (!message.mentions.users.size) return message.channel.send('No user was mentioned')
        var issued = message.mentions.members.first()
        let warns = db.prepare('SELECT id FROM warns WHERE guild=? AND user=?').all(message.guild.id, issued.id)

        var number = parseInt(param[2])
        if (number > warns.length || number < 1) return message.channel.send(`Warn #${param[2]} not found`)

        var warn = warns[number - 1]
        db.prepare('DELETE FROM warns WHERE id=?').run(warn.id)

        var embed = new MessageEmbed()
          .setColor(message.guild.me.displayColor)
          .setDescription(`${message.author} removed warn #${number} from ${issued}\nOriginal warn: ${warn.reason}`)
          .setTimestamp()

        await logSend(db, message, embed)
        await message.channel.send(`${message.author} removed warn #${number} from ${issued}\nOriginal warn: ${warn.reason}`)
        await util.save(client.data.warns, 'warns')
        message.delete()
      }
    },

    listwarns: {
      desc: 'This is a description',
      async execute (client, message, param, db) {
        /* var issued = message.member
        if (message.mentions.users.size && message.member.roles.some(r => r.name === 'Staff Team')) */ let issued = message.mentions.members.first()

        var warnsMsg = ``
        let warns = db.prepare('SELECT id FROM warns WHERE guild=? AND user=?').all(message.guild.id, issued.id)
        for (var i = 0; i < warns.length; i++) {
          warnsMsg += `${i + warns[i].reason}\n`
        }

        var embed = new MessageEmbed()
          .setColor(issued.displayColor)
          .setDescription(warnsMsg)
          .setTitle('Issued warns')
          .setAuthor(issued.displayName, issued.user.displayAvatarURL())

        message.channel.send(embed)
      }
    },

    mute: {
      desc: 'This is a description',
      execute (client, message, param) {
        if (message.mentions.members.size === 0) {
          message.channel.send('User to mute not mentioned')
          return
        }

        var time
        // var reason = param.slice(3)
        if (isNaN(parseInt(param[2]))) {
          time = 0
          // reason = param.slice(2)
        }
        message.mentions.members.first().roles.add([message.guild.roles.find('name', 'Muted')]).then(member => {
          message.channel.send(`${member.nickname || member.user.username} has been muted.`)
          if (time > 0) {
            setTimeout(function (memb, msg) {
              if (memb.roles.some(r => r.name === 'Muted')) {
                memb.roles.remove(msg.guild.roles.find('name', 'Muted'))
              }
            }, time * 60000, member, message)
          }
        })
      }
    },

    unmute: {
      desc: 'This is a description',
      execute (client, message, param) {
        if (message.mentions.members.size === 0) {
          message.channel.send('User to unmute not mentioned')
          return
        }
        if (message.mentions.members.first().roles.some(r => r.name === 'Muted')) {
          message.mentions.members.first().roles.remove([message.guild.roles.find('name', 'Muted')])
          message.channel.send(`${message.mentions.members.first().nickname || message.mentions.users.first().username} has been unmuted`)
        } else {
          message.channel.send(`${message.mentions.members.first().nickname || message.mentions.users.first().username} is not muted`)
        }
      }
    },

    panic: {
      desc: 'This is a description',
      execute (client, message, param) {
        message.channel.overwritePermissions(message.guild.roles.get(message.guild.id), {SEND_MESSAGES: false}, 'EVERYBODY PANIC').then(ch => {
          ch.send('This channel has been temporarily blocked')
        })
      }
    },

    panicoff: {
      desc: 'this',
      execute (client, message, param) {
        message.channel.overwritePermissions(message.guild.roles.get(message.guild.id), {SEND_MESSAGES: true}, 'EVERYBODY PANIC').then(ch => {
          ch.send('This channel has been unblocked')
        })
      }
    },

    prune: {
      desc: 'This is a description',
      execute (client, message, param) {
        message.channel.bulkDelete(parseInt(param[1]) + 1)
      }
    }
  }
}
