const http = await import('http'),
    fs = await import('fs'),
    path = await import('path'),
    assets = await import('./asstes.js')
//const variables
const dirName = process.cwd(),
    {colorize}=assets,
    //mime types
    mimeTypes = {
        html: 'text/html',
        js: 'text/javascript',
        css: 'text/css',
        json: 'application/json',
        png: 'image/png',
        jpeg: 'image/jpeg',
        jpg: 'image/jpg',
        svg: 'image/svg+xml',
        gif: 'image/gif',
        ico: 'image/x-icon',
        txt: 'text/plain',
        xml: 'text/xml',
        woff: 'font/woff',
        woff2: 'font/woff2',
        eot: 'application/vnd.ms-fontobject',
        ttf: 'font/ttf',
        woff: 'application/font-woff',
        woff2: 'application/font-woff2',
        eot: 'application/vnd.ms-fontobject',
        ttf: 'application/font-ttf',
        otf: 'application/font-otf',
        pdf: 'application/pdf',
        zip: 'application/zip',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        webm: 'audio/webm',
        m4a: 'audio/mp4',
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
        webp: 'image/webp',
        avif: 'image/avif',
        default: 'application/octet-stream'
    },
    mimeTypes2 = {
        '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.xml': 'text/xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/font-ttf',
    '.otf': 'application/font-otf',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.webm': 'video/webm',
    '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4',
    '.ogg': 'video/ogg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    'default': 'application/octet-stream'
    }
//let variables
let defaultPublicPath = path.join(process.cwd() || path.resolve(), 'public'),
    routes = [],
    defaultErrorPath = defaultPublicPath,
    defaultPageStatus=false
    
//settings
function setPublicPath(publicPath) {
        if (!fs.existsSync(publicPath)) {
            console.log(colorize('invalid public path, defaulting to ' + defaultPublicPath,'red','black'))
        } else {
            console.log(colorize('public path set to ' + publicPath,'green','black'));
            defaultPublicPath=publicPath
        }       
}

function setRoute(route,callback) {
    let routeObject = {
        route,
        callback
    }
    routes.push(routeObject)
}
function setErrorPage(errorPath) {
    let errorPathOf = path.join(defaultErrorPath, errorPath)
    if(!errorPathOf.startsWith(defaultErrorPath)) {
        console.log(colorize('invalid error path, defaulting to ' + defaultErrorPath,'red','black')) 
        return
    }
    if (!fs.existsSync(errorPathOf)) {
        console.log(colorize('invalid path defaulting to ' + defaultErrorPath,'red','black'))
        return
    }
    defaultErrorPath = errorPathOf
}
function server(PORT) {
    console.log(colorize(assets.fm ,'yellow','reset'))
    const httpServer = http.createServer((req, res) => {
        if (routes.length == 0) {
            let filePath = path.join(defaultPublicPath, 'index.html')
            if (!fs.existsSync(filePath)) { 
                console.log(colorize('file not found at defaultAssets path of server:' + filePath,'red','black'));
                return
            }
            if (!defaultPageStatus) { 
                const wStream = fs.createWriteStream(filePath)
                wStream.on('error', () => {
                    console.log(colorize('error writing file:' + filePath,'red','black'));
                    return
                })
                wStream.write(assets.html)
                wStream.end(() => {
                    console.log(colorize('Warning: The index page in the public folder will be overwritten if no routes are defined or when the routes are reset.' ,'yellow','black'));
                })
                defaultPageStatus = true
            }
            const stream = fs.createReadStream(filePath)
            stream.on('error', () => {
                console.log(colorize('error reading file:' + filePath,'red','black'));
                return
            })
            stream.pipe(res)
            stream.on('end', () => {
               res.end()
            })
           
        }
        res.send = (data, type, error) => {
            let headertype = 'application/octet-stream',
                statusCode = (error) ? 500 : 200
            switch (type) {
                case 'json':
                    headertype = 'application/json'
                    res.writeHead(statusCode, { 'Content-Type': headertype })
                    res.end(data)
                    break
                case 'message':
                    headertype = 'text/plain'
                    res.writeHead(statusCode, { 'Content-Type': headertype })
                    res.end(data)
                    break
                case 'html':
                    headertype = 'text/html'
                    let filePath = path.join(defaultPublicPath, data)
                    if (!filePath.startsWith(defaultPublicPath)) {
                        res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
                        res.end('Bad Request');
                        return;
                    }
                    if (!fs.existsSync(filePath)) {
                        console.log('file not found:' + filePath);
                        statusCode=500
                        res.writeHead(statusCode, { 'Content-Type': 'text/plain' })
                        res.end('file not found or default error page not found')
                        return
                    }
                    const stream = fs.createReadStream(filePath)
                    stream.on('error', () => {
                        if (!res.headersSent) {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                        }
                        res.end('internal server error in read stream');
                    })
                    res.writeHead(statusCode, { 'Content-Type': headertype })
                    stream.pipe(res)
                    stream.on('end', () => {
                        res.end()
                    })
                    break
                default:
                    let ext = path.extname(data)
                    if (mimeTypes[ext] || mimeTypes2[ext]) {
                        headertype = mimeTypes[ext] || mimeTypes2[ext]
                        let filePath = path.join(defaultPublicPath, data)
                        if (!fs.existsSync(filePath)) {
                            console.log('file not found:' + filePath);
                            statusCode=500
                            res.writeHead(statusCode, { 'Content-Type': 'text/plain' })
                            res.end('file not found')
                            return                        
                        }
                        res.writeHead(statusCode, { 'Content-Type': headertype })
                        const stream = fs.createReadStream(filePath)
                        stream.on('error', () => {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('error reading file:' + filePath);
                            return
                        })
                        stream.pipe(res)
                        stream.on('end', () => {
                            res.end()
                        })
                    } else {
                        res.send('error.html', 'html', error)
                    }
            } 
        }
        let url = new URL(req.url, `http://${req.headers.host}`)
        const item = routes.find(item => {
            return item.route===url.pathname
        })
        
        if (item) item.callback(req, res)
        else res.send(url.pathname,undefined)
        
                              
    })
    httpServer.listen(PORT, () => {
        console.log(colorize('server started on ','yellow','black'),colorize(' http://localhost:'+ PORT,'black','yellow'));
    })
    return httpServer
}
const fmServer = {
    server,
    settings: {
        setPublicPath,
        setRoute,
        setErrorPage,
    }
}
export default function fm() {
    return fmServer
}

