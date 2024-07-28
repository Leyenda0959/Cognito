const cooldowns = new Map();
const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_CHANNEL_ID = '1266856936276758629';
const CHANNELS = {
  linux: '1266859084619972740', // Reemplaza con el ID del canal 'linux'
  code: '1266858510369427526'   // Reemplaza con el ID del canal 'code'
};
const IGNORED_CHANNEL_ID = '1266909422358233089'; // Reemplaza con el ID del canal que deseas ignorar

function containsLink(content) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(content);
}

function isMessageTooLong(content) {
  return content.length > MAX_MESSAGE_LENGTH;
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    if (message.channel.type === 'DM') {
      const content = message.content;
      let targetChannelId = DEFAULT_CHANNEL_ID;

      // Extraer el canal objetivo del mensaje
      const channelNameMatch = content.match(/\{(linux|code)\}/);
      if (channelNameMatch) {
        const channelName = channelNameMatch[1];
        targetChannelId = CHANNELS[channelName] || DEFAULT_CHANNEL_ID;
      }

      const targetChannel = client.channels.cache.get(targetChannelId);
      if (!targetChannel) return;

      const cooldown = cooldowns.get(message.author.id);
      const now = Date.now();

      if (cooldown && (now - cooldown) < 5000) {
        await message.author.send("Por favor, espera 5 segundos antes de enviar otro mensaje.");
        return;
      }

      cooldowns.set(message.author.id, now);

      try {
        if (containsLink(content)) {
          await message.author.send("No se permiten enlaces en los mensajes.");
          return;
        }

        if (isMessageTooLong(content)) {
          await message.author.send("El mensaje es demasiado largo. Por favor, reduce su longitud.");
          return;
        }

        // Eliminar el marcador de canal del mensaje antes de enviarlo
        const cleanedContent = content.replace(/\{(linux|code)\}/, '').trim();
        await targetChannel.send(cleanedContent);
      } catch (error) {
        console.error('Error al manejar el mensaje privado:', error);
      }
    } else {
      if (message.channel.id === IGNORED_CHANNEL_ID) {
        return; // Ignorar mensajes en el canal específico
      }

      const logChannel = message.guild.channels.cache.get('1262916407344238592');
      if (!logChannel) return;

      try {
        if (containsLink(message.content)) {
          await message.author.send("No se permiten enlaces en los mensajes.");
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
        await message.channel.send(`${message.content}`);
      } catch (error) {
        console.error('Error al manejar el mensaje en el servidor:', error);
      }
    }
  }
};
