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

// Manejo de mensajes y comandos
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Ignorar mensajes normales en el canal especificado, pero permitir comandos
  const IGNORED_CHANNEL_ID = '1266909422358233089'; // Reemplaza con el ID del canal que deseas ignorar

  if (message.content.startsWith('%')) {
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      await message.reply('Hubo un error al ejecutar ese comando.');
    }
  } else if (message.channel.id !== IGNORED_CHANNEL_ID) {
    // Manejo de mensajes normales
    const logChannel = message.guild.channels.cache.get('1262916407344238592');
    if (!logChannel) return;

    try {
      const cooldowns = new Map();
      const MAX_MESSAGE_LENGTH = 2000;
      const DEFAULT_CHANNEL_ID = '1266856936276758629';
      const CHANNELS = {
        linux: '1266859084619972740', 
        code: '1266858510369427526'
      };

      function containsLink(content) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return urlRegex.test(content);
      }

      function containsMention(content) {
        const mentionRegex = /@(?:everyone|here|[&!]\d+)/g;
        return mentionRegex.test(content);
      }

      function isMessageTooLong(content) {
        return content.length > MAX_MESSAGE_LENGTH;
      }

      if (containsLink(message.content)) {
        await message.author.send("No se permiten enlaces en los mensajes.");
        await message.delete();
        return;
      }

      if (containsMention(message.content)) {
        await message.author.send("No se permiten menciones en los mensajes.");
        await message.delete();
        return;
      }

      if (isMessageTooLong(message.content)) {
        await message.author.send("El mensaje es demasiado largo. Por favor, reduce su longitud.");
        await message.delete();
        return;
      }

      await message.delete();
      await logChannel.send(`@${message.author.tag}: ${message.content}`);
      await message.channel.send(`****>**** ${message.content}`);
    } catch (error) {
      console.error('Error al manejar el mensaje en el servidor:', error);
    }
  }
});

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
        
