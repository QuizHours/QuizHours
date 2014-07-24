//Test code taken from 
//https://github.com/heroku-examples/node-ws-test/blob/master/server.js

var WebSocketServer = require('ws').Server,
  MongoClient = require('mongodb').MongoClient,
  //MongoServer = require('mongodb').Server,
  fs = require('fs'),
	http = require('http'),
	path = require('path'),
	express = require('express'),
	app = express(),
	port = process.env.PORT || 5000,
	mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost:27017',
  router = express.Router();

MongoClient.connect(mongoUri, function(err, db){
  if(err) throw err;
  db.collection('test_insert').drop(); //clear collection for time being while testing
  var collection = db.collection('test_insert');
  var filename = 'cme100_summer2014.json';
  fs.readFile(path.join(process.cwd(), '/data/courses/'+filename), 'utf8', function(err, data){
    var initialCourse;
    if(err){
      console.log('error reading from file');
      return;
    } else {
      initialCourse = JSON.parse(data);
    }
    collection.insert(initialCourse, function(err, docs){
      collection.find().toArray(function(err, results){
          db.close();
      });
    });
  });
});

router.route('/courses/:filename')

  .get(function(req, res){
    //retrieve requested file from mongodb
    /*fs.readFile(path.join(process.cwd(),'/data/courses/'+req.params.filename), 'utf8', function(err, data){
      if (err){
        res.send(err);
      } else {
        res.json(JSON.parse(data)); //JSON.parse needed to convert string to JSON object
      }
    });*/
  });

app.use('/data', router);

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(port);

//WebSocket stuff...not needed in 1.0
/*var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws){
		var id = setInterval(function(){
				ws.send(JSON.stringify(new Date()), function(){});
		}, 100);

		ws.on('close', function(){
				clearInterval(id);
		});
});*/
