//Test code taken from 
//https://github.com/heroku-examples/node-ws-test/blob/master/server.js

var WebSocketServer = require('ws').Server,
	http = require('http'),
	express = require('express'),
	app = express(),
	port = process.env.PORT || 5000;
		
app.use(express.static(__dirname + '/public'));

//WebSocket stuff...not needed in 1.0
var server = http.createServer(app);	//Why is this line needed?
server.listen(port);
		
var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws){
		var id = setInterval(function(){
				ws.send(JSON.stringify(new Date()), function(){});
		}, 100);

		ws.on('close', function(){
				clearInterval(id);
		});
});