require("dotenv").config();
const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const pvp = require("mineflayer-pvp").plugin;

// ====== CONFIG ======
const SERVER_ADDRESS = process.env.MC_HOST || "YOURSERVER.aternos.me";
const SERVER_PORT = parseInt(process.env.MC_PORT) || 25565;
const BOT_USERNAME = process.env.BOT_USERNAME || "UltraKiller";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "";
const ENABLE_PVP = process.env.ENABLE_PVP === "true" || false;
const ANTI_AFK_INTERVAL = parseInt(process.env.ANTI_AFK_INTERVAL) || 60;
// ===================

function startBot() {
  console.log("Connecting to:", SERVER_ADDRESS, SERVER_PORT);

  const bot = mineflayer.createBot({
    host: SERVER_ADDRESS,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    version: false,
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

  bot.once("spawn", () => {
    console.log("✅ Bot joined server");

    const mcData = require("minecraft-data")(bot.version);
    const movements = new Movements(bot, mcData);
    bot.pathfinder.setMovements(movements);

    // Auto login/register
    if (AUTH_PASSWORD !== "") {
      setTimeout(() => {
        bot.chat(`/register ${AUTH_PASSWORD} ${AUTH_PASSWORD}`);
        bot.chat(`/login ${AUTH_PASSWORD}`);
      }, 3000);
    }

    // Anti-AFK
    setInterval(() => {
      bot.setControlState("forward", true);
      bot.setControlState("jump", true);
      setTimeout(() => {
        bot.setControlState("forward", false);
        bot.setControlState("jump", false);
      }, 800);
      console.log("💤 Anti-AFK ping");
    }, ANTI_AFK_INTERVAL * 1000);

    // Optional PvP
    if (ENABLE_PVP) {
      setInterval(() => {
        const players = Object.values(bot.players).filter(
          (p) => p.entity && p.username !== bot.username
        );
        if (players.length > 0) {
          const target = players[0];
          console.log("⚔ Attacking:", target.username);
          bot.pvp.attack(target.entity);
        }
      }, 5000);
    }
  });

  // Auto respawn
  bot.on("death", () => {
    console.log("☠ Bot died — Respawning...");
    setTimeout(() => bot.respawn(), 2000);
  });

  // Simple offline AI chat
  bot.on("chat", (username, message) => {
    if (username === bot.username) return;
    const msg = message.toLowerCase();
    if (msg.includes(bot.username.toLowerCase())) {
      if (msg.includes("hello") || msg.includes("hi")) bot.chat(`Hello ${username} 😎`);
      else if (msg.includes("follow me")) {
        const player = bot.players[username];
        if (player && player.entity) bot.pathfinder.setGoal(new goals.GoalFollow(player.entity, 1), true);
      }
      else if (msg.includes("stop")) {
        bot.pvp.stop();
        bot.chat("Stopping attack.");
      }
      else if (msg.includes("dance")) {
        bot.setControlState("jump", true);
        setTimeout(() => bot.setControlState("jump", false), 1000);
        bot.chat("💃");
      } else bot.chat("What do you want? 😎");
    }
  });

  // Reconnect
  bot.on("end", () => {
    console.log("🔄 Disconnected — Reconnecting in 20s...");
    setTimeout(startBot, 20000);
  });

  bot.on("error", (err) => console.log("❌ Error:", err.message));
}

startBot();
