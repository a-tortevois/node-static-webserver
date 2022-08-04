import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTTP_PORT = process.env.npm_package_config_http_port || 3000;
const MIME_TYPE = {
    ico: 'image/x-icon',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    ttf: 'application/font-sfnt',

    // other text/plain
    log: 'text/plain',
    txt: 'text/plain',

    // wav: 'audio/wav',
    // mp3: 'audio/mpeg',
    // pdf: 'application/pdf',
    // doc: 'application/msword',
    // eot: 'appliaction/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
    if (req.method !== 'GET') {
        console.error('Error 501:', req.method);
        res.writeHead(501, {'Content-Type': 'text/html'});
        return res.end('501 Not Implemented');
    }
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    const localPathname = path.join(__dirname, 'public', pathname.replace(/\/$/, '/index.html'));
    console.log(req.method, req.url, localPathname);
    const extname = path.extname(localPathname).slice(1);
    if (!MIME_TYPE.hasOwnProperty(extname)) {
        res.writeHead(403, {'Content-Type': 'text/html'});
        return res.end('403 Forbidden');
    }
    fs.stat(localPathname, (err, stats) => {
        if (err) {
            console.error('Error 404:', err);
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end('404 Not Found');
        }
        const readerStream = fs.createReadStream(localPathname);
        readerStream.on('open', () => {
            res.writeHead(200, {'Content-Type': MIME_TYPE[extname] || 'text/plain'});
            readerStream.pipe(res);
        });
        readerStream.on('error', () => {
            console.error('Error 500:', err);
            res.writeHead(500, {'Content-Type': 'text/html'});
            return res.end('500 Internal Server Error');
        });
    });
});

server.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`Listening on http://localhost:${HTTP_PORT}/`);
});
