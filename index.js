// Dependencies
const Discord = require('discord.js'); 
const fs = require('fs');
const config = require('./config.json');
const CatLoggr = require('cat-loggr');
const startServer = require('./keep_alive');

// Start the keep-alive server with error handling
startServer()
  .then(server => {
    console.log('Keep-alive server started successfully');
  })
  .catch(error => {
    console.error('Failed to start keep-alive server:', error);
  });



// Functions
const client = new Discord.Client({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_MEMBERS',
        'DIRECT_MESSAGES'
    ]
});
const log = new CatLoggr();

// New discord collections
client.commands = new Discord.Collection();

// Logging
if (config.debug === true) client.on('debug', stream => log.debug(stream)); // if debug is enabled in config
client.on('warn', message => log.warn(message));
client.on('error', error => log.error(error));

// Load commands from folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Command directory
for (const file of commandFiles) {
	const command = require(`./commands/${file}`); // Load the command
    log.init(`Loaded command ${file.split('.')[0] === command.name ? file.split('.')[0] : `${file.split('.')[0]} as ${command.name}`}`); // Logging to console
	client.commands.set(command.name, command); // Set command by name to the discord "commands" collection
};

// Client login
const token = process.env.token;
if (!token) {
    log.error('Bot token not found! Please add it in the Secrets tab (🔒 icon) with key "token"');
    process.exit(1);
}
log.info('Found token, attempting to connect...');

function connectBot() {
    try {
        client.login(token).then(() => {
            log.info('Successfully connected to Discord!');
        }).catch(error => {
            log.error('Failed to login to Discord. Error details:');
            log.error(error);
            
            if (error.code === 'TOKEN_INVALID') {
                log.error('The token appears to be invalid. Please check your token in the Secrets tab.');
            } else if (error.code === 'DISALLOWED_INTENTS') {
                log.error('Please enable necessary intents in the Discord Developer Portal.');
            }
            setTimeout(connectBot, 10000); // Retry after 10 seconds
        });
    } catch (err) {
        log.error('Unexpected error during login:', err);
        setTimeout(connectBot, 10000); // Retry after 10 seconds
    }
}

// Add reconnection handling
client.on('disconnect', () => {
    log.warn('Bot disconnected! Attempting to reconnect...');
    setTimeout(connectBot, 5000); // Try to reconnect after 5 seconds
});

client.on('error', (error) => {
    log.error('Client error:', error);
    if (!client.isReady()) {
        setTimeout(connectBot, 5000);
    }
});

connectBot();

// Add reconnection handling
client.on('disconnect', () => {
    log.warn('Bot disconnected! Attempting to reconnect...');
    connectBot();
});

client.once('ready', () => {
	log.info(`I am logged in as ${client.user.tag} to Discord!`); // Say hello to console
    client.user.setActivity(`${config.prefix}help │ ${config.servername}`, { type: "WATCHING" }); // Set the bot's activity status
    /* You can change the activity type to:
     * LISTENING
     * WATCHING
     * COMPETING
     * STREAMING (you need to add a twitch.tv url next to type like this:   { type: "STREAMING", url: "https://twitch.tv/twitch_username_here"} )
     * PLAYING (default)
    */
});

// Discord message event and command handling
client.on('message', (message) => {
	if (!message.content.startsWith(config.prefix)) return; // If the message does not start with the prefix 
	if (message.author.bot) return; // If a command executed by a bot
//Made By ScienceGear#4409 Youtube https://www.youtube.com/c/ScienceGearYT
    // Split message content to arguments
	const args = message.content.slice(config.prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

    // If the command does not exists
	if (config.command.notfound_message === true && !client.commands.has(command)) {
        return message.channel.send(
            new Discord.MessageEmbed()
            .setColor(config.color.red)
            .setTitle('Unknown command :(')
            .setDescription(`Sorry, but I cannot find the \`${command}\` command!`)
            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
            .setTimestamp()
        );
    };

    // Executing the command
	try {
		client.commands.get(command).execute(message, args); // Execute
	} catch (error) {
		log.error(error); // Logging if error

        // Send error messsage if the "error_message" field is "true" in the configuration
		if (config.command.error_message === true) {
            message.channel.send(
                new Discord.MessageEmbed()
                .setColor(config.color.red)
                .setTitle('Error occurred!')
                .setDescription(`An error occurred while executing the \`${command}\` command!`)
                .addField('Error', `\`\`\`js\n${error}\n\`\`\``)
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                .setTimestamp()
            );
        };
	};
});
//Made By ScienceGear#4409 Youtube https://www.youtube.com/c/ScienceGearYT