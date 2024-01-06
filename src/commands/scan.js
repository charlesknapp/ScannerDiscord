const { SlashCommandBuilder } = require('@discordjs/builders');
const { Modal, TextInputComponent, ButtonComponent } = require('discord.js');
const fetch = require('node-fetch');
const { token: apiKey } = require('../.env'); // Load VirusTotal API key

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scan')
        .setDescription('Scan a file for potential viruses'),
    async execute(interaction) {
        // Create the "Scan File" button and handle interaction
        const scanFileButton = new ButtonComponent()
            .setLabel('Scan File')
            .setStyle('PRIMARY')
            .setCustomId('scan_file');

        await interaction.reply({ content: 'Choose an action:', components: [scanFileButton] });

        interaction.channel.awaitMessages({ filter: (message) => message.author.id === interaction.user.id }, {
            max: 1,
            time: 60000, // Wait for 60 seconds
        })
        .then(async (collected) => {
            if (collected.size === 1) {
                await interaction.followUp({ content: 'Timed out. Please try again.' });
            } else {
                await interaction.followUp({ ephemeral: true }); // Clear ephemeral message
            }
        })
        .catch(() => {
            // Handle timeout or error
        });

        interaction.client.on('interactionCreate', async (interaction) => {
            if (interaction.customId === 'scan_file' && interaction.user.id === interaction.commandInteraction.user.id) {
                // Create the file upload modal
                const modal = new Modal()
                    .setCustomId('file_upload_modal')
                    .setTitle('Upload File')
                    .addComponents(
                        new TextInputComponent()
                            .setCustomId('file_input')
                            .setLabel('Upload a file to scan')
                            .setStyle('PARAGRAPH')
                            .setRequired(true)
                            .setPlaceholder('Drag and drop or browse for a file'),
                        new ActionRowComponent().addComponents(
                            new ButtonComponent()
                                .setCustomId('submit_file')
                                .setLabel('Scan')
                                .setStyle('PRIMARY')
                        )
                    );

                await interaction.replyModal(modal);
            }

            if (interaction.customId === 'submit_file' && interaction.user.id === interaction.commandInteraction.user.id) {
                // Handle file submission and VirusTotal scan
                const file = interaction.fields.get('file_input').value;

                try {
                    const response = await fetch(`https://www.virustotal.com/api/v3/files`, {
                        method: 'POST',
                        headers: {
                            'x-apikey': apiKey,
                            'Content-Type': file.mimetype,
                        },
                        body: file,
                    });

                    const scanData = await response.json();
                    const scanId = scanData.data.id;

                    const scanDetails = await fetch(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
                        headers: { 'x-apikey': apiKey },
                    });

                    const results = await scanDetails.json();

                    // Update modal content to display scan results dynamically
                    interaction.update({
                        content: 'Scan results:',
                        embeds: [scanSummary], // Add the summary embed
                        components: [
                            new ActionRowComponent().addComponents(
                                new ButtonComponent()
                                    .setCustomId('view_report')
                                    .setLabel('View Full Report')
                                    .setStyle('LINK')
                            ),
                        ],
                    });
                    
                    // Handle button interactions
                    client.on('interactionCreate', async (interaction) => {
                        if (interaction.customId === 'view_report') {
                            // Open the full report in the user's browser
                            await interaction.reply({ content: results.data.links.self });
                        }
                    });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'An error occurred during the scan.' });
                }
            }
        });
    },
};