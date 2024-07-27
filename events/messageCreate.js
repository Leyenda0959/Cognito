const cooldowns = new Map();
const MAX_MESSAGE_LENGTH = 2000;
let messageCounter = 1; // Variable global para el contador

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
      const guild = client.guilds.cache.get('1262219586506592268');
      if (!guild) return;

      const targetChannel = guild.channels.cache.get('1265181330665246750');
      const logChannel = guild.channels.cache.get('1262916407344238592');

      if (!targetChannel || !logChannel) return;

      const cooldown = cooldowns.get(message.author.id);
      const now = Date.now();

      if (cooldown && (now - cooldown) < 5000) {
        await message.author.send("Por favor, espera 5 segundos antes de enviar otro mensaje.");
        return;
      }

      cooldowns.set(message.author.id, now);

      try {
        if (containsLink(message.content)) {
          await message.author.send("No se permiten enlaces en los mensajes.");
          return;
        }

        if (isMessageTooLong(message.content)) {
          await message.author.send("El mensaje es demasiado largo. Por favor, reduce su longitud.");
          return;
        }

        const messageNumber = messageCounter++;
        await targetChannel.send(`${messageNumber} ***>>*** ${message.content}`);
        await logChannel.send(`@${message.author.tag}: [privado] ${message.content}`);
      } catch (error) {
        console.error('Error al manejar el mensaje privado:', error);
      }
    } else {
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

        const messageNumber = messageCounter++;
        await message.delete();
        await logChannel.send(`@${message.author.tag}: ${message.content}`);
        await message.channel.send(`${messageNumber} ***>*** ${message.content}`);
      } catch (error) {
        console.error('Error al manejar el mensaje en el servidor:', error);
      }
    }
  }
};
