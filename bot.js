const fs = require('fs');
const util = require('util');
const Discord = require('discord.js');
const { prefix } = require('./config.json');
const { RichEmbed } = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.on('ready', () => {
	client.user.setPresence({
		game: {
			name: 'Looking BadWords and create Channels', //Status des Bots bitte hier einfach ändern PS MIT // machst du ein Zeilen kommentar
			type: 0
		}
	})
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('Den Befehl kann ich nicht in DMs ausführen!');
	}

	if (command.args && !args.length) {
		let reply = `Bitte gib Argumente für den Befehl an, ${message.author}!`;

		if (command.usage) {
			reply += `\nSo kannst du den Befehl nutzen: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Bitte warte ${timeLeft.toFixed(1)} Sekunden, bevor du den \`${command.name}\` Befehl nocheinmal benutzt.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('Fehler beim Versuch den Befehl auszuführen!');
	}
});





// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
