const vscode = require('vscode');
const fs = require('fs');

/**
 * Beautifies a JBeam file by formatting it with consistent indentation and spacing.
 * @param {string} inputJBeam - The raw JBeam file content as a string.
 * @returns {string} - Beautified JBeam content.
 */
function beautifyJBeam(inputJBeam) {
    try {
        // Remove any existing excessive whitespace
        let cleanedJBeam = inputJBeam.trim();

        // Remove comments from JBeam (both single-line and block comments)
        cleanedJBeam = cleanedJBeam.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''); 

        // Parse the cleaned content into JSON format
        let parsedData = JSON.parse(cleanedJBeam);

        // Reformat the JSON data with consistent indentation (4 spaces)
        let beautifiedJBeam = JSON.stringify(parsedData, null, 4);

        return beautifiedJBeam;
    } catch (error) {
        console.error("Failed to beautify JBeam file:", error);
        return inputJBeam; // Return original content if an error occurs
    }
}

/**
 * Utility function to apply the beautifier to a file.
 * @param {string} filePath - Path to the JBeam file.
 * @param {function} onComplete - Callback once the process is done.
 */
function beautifyJBeamFile(filePath, onComplete) {
    // Read the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Failed to read JBeam file:", err);
            return;
        }

        // Beautify the content
        let beautifiedContent = beautifyJBeam(data);

        // Write the beautified content back to the file
        fs.writeFile(filePath, beautifiedContent, (writeErr) => {
            if (writeErr) {
                console.error("Failed to write beautified content:", writeErr);
            } else {
                console.log("JBeam file successfully beautified.");
            }

            // Callback if provided
            if (onComplete) onComplete();
        });
    });
}

module.exports = { beautifyJBeamFile };
