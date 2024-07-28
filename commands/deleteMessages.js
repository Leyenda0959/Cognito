const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Borra todos los mensajes de un usuario en todo el servidor.',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('No tienes permisos para usar este comando.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Debes mencionar a un usuario para borrar sus mensajes.');
    }

    const fetchMessages = async (channel) => {
      let messages;
      let messageCount = 0;
      let lastMessageId = null;

      do {
        messages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
        const userMessages = messages.filter(msg => msg.author.id === user.id);

        for (const [msgId, msg] of userMessages) {
          await msg.delete();
        }

        messageCount += userMessages.size;
        lastMessageId = messages.last() ? messages.last().id : null;
      } while (messages.size === 100);

      return messageCount;
    };

    let totalDeleted = 0;
    const channels = message.guild.channels.cache.filter(channel => channel.isText());

    for (const [channelId, channel] of channels) {
      totalDeleted += await fetchMessages(channel);
    }

    const embed = new MessageEmbed()
      .setTitle('Limpieza de Mensajes')
      .setDescription(`Se han borrado ${totalDeleted} mensajes de ${user.tag}.`)
      .setColor('#FF0000');

    message.channel.send({ embeds: [embed] });
  },
};
