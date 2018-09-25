var util = require('../../utilities.js')

var express = require('express')
var app = express()
var session = require('express-session')

var passport = require('passport')

var Strategy = require('passport-discord').Strategy

var scopes = ['identify', 'guilds']

function checkAuth (req, res, next) {
  if (req.isAuthenticated()) return next()
  res.send('not logged in :(')
}

let args = process.argv.slice(2)

module.exports = {
  events: {
    async ready (client, db) {
      let discordApp = await client.fetchApplication()

      passport.use(new Strategy({
        clientID: discordApp.id,
        clientSecret: client.data.tokens.secret,
        callbackURL: args[0] || 'https://akobot.tk/callback',
        scope: scopes
      }, function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile)
        })
      }))

      passport.serializeUser(function (user, done) {
        done(null, user)
      })
      passport.deserializeUser(function (obj, done) {
        done(null, obj)
      })

      app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false
      }))

      app.use(passport.initialize())
      app.use(passport.session())
      app.get('/login', passport.authenticate('discord', { scope: scopes }), function (req, res) {})
      app.get('/callback',
        passport.authenticate('discord', { failureRedirect: '/login' }), function (req, res) { res.redirect('/info') } // auth success
      )
      app.get('/logout', function (req, res) {
        req.logout()
        res.redirect('/login')
      })

      app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
      })

      app.get('/members/:guild', function (req, res) {
        let guild = client.guilds.get(req.params.guild)
        if (guild) { res.send(guild.members.size.toString()) } else { res.sendStatus(404) }
      })

      app.get('/info', checkAuth, function (req, res) {
        // console.log(req.user)
        // res.json(req.user);
        res.send('Rawr :3')
      })

      /*app.listen(8080, function () {
        util.log(client, 'Request API up and running, sir!')
      })*/
    }
  }
}
