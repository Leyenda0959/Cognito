require('dotenv').config();
const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');

const token = process.env.DISCORD_TOKEN;

const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_MEMBERS, 
    Intents.FLAGS.DIRECT_MESSAGES
  ],
  partials: ['CHANNEL']
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

// Función para borrar mensajes después de un cierto tiempo
async function autoDeleteMessages() {
  const deleteAfterMilliseconds = 500; // 1 minuto

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignora los mensajes del bot

    setTimeout(async () => {
      try {
        await message.delete();
      } catch (err) {
        console.error('Error al borrar el mensaje:', err);
      }
    }, deleteAfterMilliseconds);
  });
}

autoDeleteMessages();

client.login(token);
