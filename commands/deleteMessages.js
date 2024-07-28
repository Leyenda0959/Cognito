const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'delmessage',
  description: 'Delete all messages of a specified user in the server',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Por favor menciona a un usuario.');
    }

    let deletedCount = 0;

    const channels = message.guild.channels.cache.filter(channel => channel.isText());
    for (const channel of channels.values()) {
      let fetchedMessages;
      do {
        fetchedMessages = await channel.messages.fetch({ limit: 100 });
        const userMessages = fetchedMessages.filter(msg => msg.author.id === user.id);

        for (const msg of userMessages.values()) {
          await msg.delete();
          deletedCount++;
        }
      } while (fetchedMessages.size >= 100);
    }

    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Mensajes eliminados')
      .setDescription(`Se eliminaron ${deletedCount} mensajes de @${user.tag}.`)
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
