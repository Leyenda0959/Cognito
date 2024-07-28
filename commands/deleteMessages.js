const { Permissions } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Borra una cantidad específica de mensajes en el canal mencionado',
  async execute(message, args) {
    if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      return message.reply('No tienes permisos para usar este comando.');
    }

    if (args.length < 2) {
      return message.reply('Debes especificar un número de mensajes y un canal.');
    }

    const amount = parseInt(args[0]);
    const targetChannel = message.mentions.channels.first();

    if (!targetChannel) {
      return message.reply('Debes mencionar un canal válido.');
    }

    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply('Debes especificar un número entre 1 y 100.');
    }

    try {
      const fetchedMessages = await targetChannel.messages.fetch({ limit: amount });
      await targetChannel.bulkDelete(fetchedMessages, true);
      const reply = await message.channel.send(`Se han borrado ${amount} mensajes en ${targetChannel}.`);
      setTimeout(() => reply.delete(), 5000);
    } catch (error) {
      console.error('Error al borrar mensajes:', error);
      message.reply('Hubo un error al intentar borrar los mensajes en este canal.');
    }
  },
};
      
