
async function startBot () {
  const Discord = require('discord.js')
  const glob = require('glob')

  const Sqlite = require('better-sqlite3')
  let db = new Sqlite('data/database.db')

  var util = require('./utilities.js')

  const client = new Discord.Client()
  client.commands = new Discord.Collection()

  let modules = glob.sync(`modules/**/*`)
  let dataFiles = glob.sync(`data/*`)

  client.data = {}

  let eventModules = {}
  for (const file of modules) {
    if (!file.endsWith('.js')) continue
    let pathArray = file.split('/')
    let name = pathArray[pathArray.length - 1].split('.js')[0]
    console.log(pathArray)

    try {
      let jsObject = require(`./${file}`)
      if (jsObject.reqs) {
        await jsObject.reqs(client, db)
      }

      switch (name) {
        case 'commands':
          let commands = jsObject.commands
          Object.keys(commands).forEach(async commandName => {
            client.commands.set(commandName, commands[commandName])
            client.commands.get(commandName).type = pathArray[pathArray.length - 2]

            let command = commands[commandName]
            if (command.alias) {
              command.alias.forEach(alias => {
                client.commands.set(alias, commands[commandName])
              })
            }
          })
          break

        case 'events':
          let events = jsObject.events

          Object.keys(events).forEach(eventName => {
            if (!eventModules[eventName]) eventModules[eventName] = []
            eventModules[eventName].push(events[eventName])
          })
          break
      }
    } catch (e) {
      console.log(`Failed to load ${file}`)
      console.log(e.stack)
      continue
    }
  }

  for (const file of dataFiles) {
    if (!file.endsWith('.json')) continue
    const data = require(`./${file}`)

    let pathArray = file.split('/')
    let name = pathArray[pathArray.length - 1].split('.json')[0]
    client.data[name] = data
  }

  Object.keys(eventModules).forEach(eventName => {
    client.on(eventName, (...args) => {
      eventModules[eventName].forEach(func => {
        func(client, db, ...args)
      })
    })
  })

  /* client.on('ready', async () => {
await util.log(client,'I am ready!');
}); */

  process.on('unhandledRejection', err => { if (err.message !== 'Unknown User') util.log(client, err.stack) })
  client.login(client.data.tokens.akira)
}

startBot()
