const { SlashCommandBuilder } = require('@discordjs/builders');
const virusTotalApi = require('../utils/virusTotalApi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scanfile')
        .setDescription('Scan a file using VirusTotal')
        .addAttachmentOption(option => 
            option.setName('file')
                .setDescription('The file to scan')
                .setRequired(true)),
    async execute(interaction) {
        // Get the file from the interaction
        const fileAttachment = interaction.options.getAttachment('file');

        // Respond to the interaction indicating the process has started
        await interaction.deferReply();

        // Use the VirusTotal API to scan the file
        await virusTotalApi.scanFile(fileAttachment, interaction);
    }
};