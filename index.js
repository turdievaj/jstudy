require('dotenv').config();
const { Client, IntentsBitField, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Create the client with correct intents
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
  ],
});

// Initialize commands collection
client.commands = new Collection();

// Load commands from ./commands folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
  }
}

// Bot ready event
client.on('ready', (c) => {
  console.log(`🪼 ${c.user.tag} is online`);
});

// Slash command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
