const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const pvp = require("mineflayer-pvp").plugin;

// ===== CONFIG =====
const SERVER_ADDRESS = "mafiauniverse2026.aternos.me"; // Replace with your server
const SERVER_PORT = 57589;                       // Replace with your port
const BOT_USERNAME = "UltraKiller26";             // Bot username
const AUTH_PASSWORD = "";                        // Leave "" if none
const ENABLE_PVP = true;                        // true to attack nearby players
const ANTI_AFK_INTERVAL = 60;                    // seconds
// ==================

function startBot() {
  console.log("Connecting to:", SERVER_ADDRESS, SERVER_PORT);

  const bot = mineflayer.createBot({
    host: SERVER_ADDRESS,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    version: "1.21", // fixed version
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

  bot.once("spawn", () => {
    console.log("✅ Bot joined server successfully");

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

    // Anti-AFK movement
    setInterval(() => {
      bot.setControlState("forward", true);
      bot.setControlState("jump", true);
      setTimeout(() => {
        bot.setControlState("forward", false);
        bot.setControlState("jump", false);
      }, 800);
      console.log("💤 Anti-AFK active");
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

  // Offline AI chat
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

  // Reconnect on disconnect
  bot.on("end", () => {
    console.log("🔄 Disconnected — Reconnecting in 20s...");
    setTimeout(startBot, 20000);
  });

  bot.on("error", (err) => console.log("❌ Error:", err.message));
}

startBot();
