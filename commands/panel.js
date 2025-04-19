// Dependencies
const { MessageEmbed, Message } = require('discord.js');
const config = require('../config.json');

module.exports = {
	name: 'panel', // Command name
	description: 'Display the server website', // Command description

    /**
     * Command exetute
     * @param {Message} message The message sent by user
     */
	execute(message) {
		const { commands } = message.client; // Get commands from the client
        
        message.channel.send(
            new MessageEmbed()
            .setColor(config.color.default)
            .setTitle('Server Website')
            .setDescription(`**Hello**, You Want To See Our *Website* Click [**Here**](${config.website})`) // Mapping the commands
            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
            .setTimestamp()
        );
	}
};
