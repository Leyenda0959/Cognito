require('dotenv').config();
const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const token = process.env.DISCORD_TOKEN;

const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Configuración del servidor web para mantener el Repl activo
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));

client.login(token);
