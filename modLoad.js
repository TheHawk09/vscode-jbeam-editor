const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Function to load a mod from a zip file and extract it
function loadMod(zipFilePath, extractTo) {
    // Check if the zip file exists
    if (!fs.existsSync(zipFilePath)) {
        console.error(`File not found: ${zipFilePath}`);
        return;
    }

    try {
        // Load the zip file
        const zip = new AdmZip(zipFilePath);

        // Extract the content to the specified directory
        zip.extractAllTo(extractTo, true); // 'true' overwrites files if they exist
        console.log(`Mod extracted to ${extractTo}`);
    } catch (error) {
        console.error(`Failed to extract mod: ${error}`);
    }
}

// Function to prompt the user for input
function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the path to the zip file: ', (zipFilePath) => {
        rl.question('Enter the path to the extraction directory: ', (extractTo) => {
            // Call the function to load and extract the mod
            loadMod(zipFilePath, extractTo);
            rl.close();
        });
    });
}

// Start the prompt
promptUser();
