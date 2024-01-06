const fetch = require('node-fetch');
const { token: apiKey } = require('../.env'); // Load VirusTotal API key

module.exports = {
    // Function to upload a file to VirusTotal
    async uploadFile(file) {
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
            return scanId;
        } catch (error) {
            console.error('Error uploading file to VirusTotal:', error);
            throw error; // Re-throw for error handling in calling code
        }
    },

    // Function to retrieve scan results for a given scan ID
    async getScanResults(scanId) {
        try {
            const response = await fetch(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
                headers: { 'x-apikey': apiKey },
            });

            const results = await response.json();
            return results.data;
        } catch (error) {
            console.error('Error retrieving scan results:', error);
            throw error; // Re-throw for error handling in calling code
        }
    },
};