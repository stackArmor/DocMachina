const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const rootDir = __dirname; // DesktopDocumentEngine/

const server = http.createServer((req, res) => {
    // --- API Endpoint for Listing Packs (Step 1a - Unchanged) ---
    if (req.url === '/api/packs' && req.method === 'GET') {
        const packsPath = path.join(rootDir, 'packs');
        
        fs.readdir(packsPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error('Error reading packs directory:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Failed to read packs directory' }));
            }
            const packFolders = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(packFolders));
        });
        return;
    }
    
    // --- NEW API Endpoint for Listing Intake Files (Step 2a) ---
    // Matches: /api/intakes/AWS_FR_PnP
    if (req.url.startsWith('/api/intakes/') && req.method === 'GET') {
        const parts = req.url.split('/');
        const packName = parts[parts.length - 1];
        const intakesPath = path.join(rootDir, 'packs', packName, 'intakes');

        fs.readdir(intakesPath, (err, files) => {
            if (err) {
                // If directory doesn't exist, return an empty array, not a 500 error
                if (err.code === 'ENOENT') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify([]));
                }
                console.error(`Error reading intakes directory for ${packName}:`, err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Failed to read intakes directory' }));
            }
            
            // Filter to only include JSON files
            const intakeFiles = files.filter(name => name.endsWith('.json'));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(intakeFiles));
        });
        return;
    }

    // --- API Endpoint for Fetching Intakes (Step 1b - Unchanged except for structure check) ---
    // Targets: /packs/AWS_FR_PnP/aws-fr-pnp-general.json  OR /packs/AWS_FR_PnP/intakes/ac-intake-aws.json
    if (req.url.startsWith('/packs/') && req.url.endsWith('.json') && req.method === 'GET') {
        if (req.url.includes('..')) {
             res.writeHead(403);
             return res.end('Access Denied');
        }
        
        const filePath = path.join(rootDir, req.url);
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(`Error reading file ${filePath}:`, err);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Intake file not found' }));
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    // --- Static File Serving ---
    let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        // .json is handled above, but kept here for general files outside /packs/
        '.json': 'application/json', 
        '.md': 'text/plain', 
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log('Press Ctrl+C to stop the server.');
});