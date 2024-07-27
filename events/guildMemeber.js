 module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      // Cambia el nombre del usuario a "Anonymous"
      await member.setNickname('Anonymous');

      // Asigna el rol AnonUser
      const role = member.guild.roles.cache.find(role => role.name === 'AnonUser');
      if (role) {
        await member.roles.add(role);
      }

      // Enviar mensaje privado de bienvenida y notificación de cambio de nombre
      await member.send('```Bienvenido al servidor. Tu nombre ha sido cambiado a ***"Anonymous"*** para proteger tu privacidad.``` ***para doble capa de seguridad manda mensaje al dm al bot y se enviara al canal general***               *** !! Si envías mensaje directamente algun canal del servidor se mostrara tu nombre por un breve periodo de tiempo !!!***');
        
    } catch (error) {
      console.error('Error al manejar la incorporación del nuevo miembro:', error);
      const errorChannelId = '1262219587529871413'; // Reemplaza con el ID de tu canal de errores
      const errorChannel = member.guild.channels.cache.get(errorChannelId);
      if (errorChannel) {
        errorChannel.send(`Error al manejar la incorporación de ${member.user.tag}: ${error.message}`);
      }
    }
  }
};
