const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'mafiauniverse2026.aternos.me', // example: yourserver.aternos.me
  port: 25565,
  username: 'AternosBot',
  version: false // auto detect version (supports most versions)
})

bot.on('spawn', () => {
  console.log("Bot joined the server!")

  bot.chat("Hello! Bot is online 🤖")
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return

  if (message === 'ping') {
    bot.chat('pong!')
  }

  if (message === 'follow') {
    const player = bot.players[username]
    if (!player) return
    bot.chat("I am following you!")
  }
})

bot.on('kicked', console.log)
bot.on('error', console.log)
