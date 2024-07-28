module.exports = {
  name: 'clear',
  description: 'Borra una cantidad específica de mensajes en el canal actual',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('No tienes permisos para usar este comando.');
    }

    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply('Debes especificar un número entre 1 y 100.');
    }

    try {
      await message.channel.bulkDelete(amount, true);
      const reply = await message.channel.send(`Se han borrado ${amount} mensajes.`);
      setTimeout(() => reply.delete(), 5000); // Eliminar el mensaje de confirmación después de 5 segundos
    } catch (error) {
      console.error('Error al borrar mensajes:', error);
      message.reply('Hubo un error al intentar borrar los mensajes en este canal.');
    }
  },
};
