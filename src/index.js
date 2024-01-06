const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
const config = require('./config.json');

dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});

// Load commands and utilities
const commands = require('./commands');
client.commands = new Discord.Collection();
for (const file of fs.readdirSync('./commands')) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (client.commands.has(command)) {
        try {
            await client.commands.get(command).execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('An error occurred while executing the command.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);