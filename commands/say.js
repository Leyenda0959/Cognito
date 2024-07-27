module.exports = {
  name: 'say',
  description: 'Send an anonymous message',
  execute(message, args) {
    const content = args.join(' ');
    message.delete(); 
    message.channel.send(content);
  }
};

