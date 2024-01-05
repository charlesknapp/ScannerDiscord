const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

module.exports = {
    async scanFile(attachment, interaction) {
        // First, upload the file to VirusTotal
        const formData = new FormData();
        formData.append('file', attachment);

        try {
            const uploadResponse = await axios.post('https://www.virustotal.com/api/v3/files', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'x-apikey': process.env.VIRUSTOTAL_API_KEY
                }
            });

            // Check if the file was successfully uploaded and get the id
            if (uploadResponse.data && uploadResponse.data.data && uploadResponse.data.data.id) {
                const fileId = uploadResponse.data.data.id;

                // Notify the user that the file is being scanned
                await interaction.editReply({ content: `File uploaded successfully. Scanning in progress...` });

                // Retrieve the scan report
                // Note: VirusTotal scan might take some time. You might need to implement a waiting mechanism.
                const reportResponse = await axios.get(`https://www.virustotal.com/api/v3/analyses/${fileId}`, {
                    headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
                });

                // Handle the report response
                // For simplicity, we're just sending back a message. You can format this as needed.
                if (reportResponse.data) {
                    await interaction.editReply({ content: `Scan complete. Report: ${JSON.stringify(reportResponse.data)}` });
                } else {
                    await interaction.editReply({ content: `Failed to retrieve scan report.` });
                }
            } else {
                await interaction.editReply({ content: `Failed to upload file to VirusTotal.` });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `Error scanning the file: ${error.message}` });
        }
    },
};