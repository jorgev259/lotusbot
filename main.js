
async function startBot () {
  const Discord = require('discord.js')
  const glob = require('glob')

  const Sqlite = require('better-sqlite3')
  let db = new Sqlite('data/database.db')

  var util = require('./utilities.js')

  const client = new Discord.Client()
  client.commands = new Discord.Collection()

  let dataFiles = glob.sync(`data/*`)

  let modules = glob.sync(`modules/*/`)

  client.data = {}

  let eventModules = {}
  let error = true
  for (const module of modules) {
    let files = glob.sync(`${module}/*`)

    let outModule = { commands: {}, events: {} }
    let moduleName = module.split('/')[1]

    try {
      for (const file of files) {
        let pathArray = file.split('/')
        let type = pathArray[pathArray.length - 1].split('.js')[0]

        let jsObject = require(`./${file}`)
        if (jsObject.reqs) {
          await jsObject.reqs(client, db)
        }

        outModule[type] = jsObject[type]
      }

      let commandKeys = Object.keys(outModule.commands)
      let eventKeys = Object.keys(outModule.events)

      commandKeys.forEach(commandName => {
        client.commands.set(commandName, outModule.commands[commandName])
        client.commands.get(commandName).type = moduleName

        let command = outModule.commands[commandName]
        if (command.alias) {
          command.alias.forEach(alias => {
            client.commands.set(alias, outModule.commands[commandName])
          })
        }
      })

      eventKeys.forEach(eventName => {
        if (!eventModules[eventName]) eventModules[eventName] = []
        eventModules[eventName].push(outModule.events[eventName])
      })

      console.log(`Loaded module ${moduleName} with ${commandKeys.length} commands and ${eventKeys.length} events`)
      error = false
    } catch (e) {
      if (error) console.log(`Failed to load ${moduleName}\n${e.stack}\n`)
      else console.log(`\nFailed to load ${moduleName}\n${e.stack}\n`)

      error = true
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
