var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var cache = {};

function sendFile(res, filePath, fileContents){
	res.status(200);
	console.log(filePath);
	res.set('Content-Type', mime.lookup(path.basename(filePath)));
	res.end(fileContents);
}

function serveStatic(res, cache, absPath){
	if(cache[absPath]){
		sendFile(res, absPath, cache[absPath]);
	}else{
		fs.exists(absPath, function(exists){
			if(exists){
				fs.readFile(absPath, function(err, data){
					if(err){
						res.status(404);
						res.set('Content-Type', 'text/plain');

						res.end('Error 404 : resource not found');
					}else{
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				});
			}else{
				res.status(404);
				res.set('Content-Type', 'text/plain');
				res.end('Error 404 : resource not found');
			}
		});
	}
}

var app = express();
function main(req, res, next){
	serveStatic(res, cache, './public/index.html');
}
app.get('/', main);
app.get('*', function(req, res){
	serveStatic(res, cache, './public'+req.path);
});

app.set('port', 3000);
var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('express server listening...');
});
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
