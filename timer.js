const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Start a simple group timer')
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('Timer length in minutes (1–360)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(360)),
  async execute(interaction) {
    const minutes = interaction.options.getInteger('minutes');
    const seconds = minutes * 60;

    // 1. Send join message and collect users for 30 seconds
    const joinEmbed = new EmbedBuilder()
      .setTitle('⏰ Timer Starting!')
      .setDescription(`React with ✅ to join!\nTimer: **${minutes} minutes**.\n_You have 30 seconds to join!_`)
      .setColor('#1900ff');
    const joinMsg = await interaction.reply({ embeds: [joinEmbed], fetchReply: true });
    await joinMsg.react('✅');

    const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;
    const collected = await joinMsg.awaitReactions({ filter, time: 30000 });

    // Get all users who reacted
    const users = new Set();
    collected.get('✅')?.users.cache.forEach(user => {
      if (!user.bot) users.add(user.id);
    });
    users.add(interaction.user.id);

    if (users.size === 0) {
      await interaction.followUp('❌ No one joined the timer.');
      return;
    }

    const mentions = Array.from(users).map(id => `<@${id}>`).join(' ');
    await interaction.followUp({ content: `⏰ Timer started for **${minutes} minutes**!\nParticipants: ${mentions}` });

    // Wait for the timer
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));

    await interaction.followUp({ content: `⏰ **Time's up, want another round or rest?**\n${mentions}` });
  }
};
