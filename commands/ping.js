module.exports = {
    name: 'ping',
    description: 'Ping!',
    cooldown: 5,
    execute(message) {
        // teamBOT BOTCOMMANDS TESTBOTCOMMANDS
        message.channel.send('user')('Pong.');
    },
};
