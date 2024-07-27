require('dotenv').config();
const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');

const token = process.env.DISCORD_TOKEN;

const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES],
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

// Manejo de señales de apagado
const handleShutdown = async (signal) => {
  console.log(`Recibida señal ${signal}. Apagando el bot...`);
  const channelId = '1262647172193583115'; // Reemplaza con el ID del canal donde quieres enviar el mensaje de apagado
  const channel = client.channels.cache.get(channelId);
  if (channel) {
    await channel.send('El bot está a punto de apagarse. Guardando el estado...');
  }

  // Realiza aquí cualquier limpieza adicional que necesites
  await client.destroy();
  process.exit(0);
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

client.login(token);
      
