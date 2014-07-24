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
  //var filename = 'course-template2.json';
  fs.readFile(path.join(process.cwd(), '/data/courses/'+filename), 'utf8', function(err, data){
    var initialCourse;
    if(err){
      console.log('error reading from file');
      return;
    } else {
      //data = data.split("\\").join("\\\\");
      //data = data.split("$").join("$$");
      //data = JSON.stringify(data).replaceAll("\\", "*");
      initialCourse = JSON.parse(data);
      //initialCourse = data;
      //console.log(data);
    }
    collection.insert(initialCourse, function(err, docs){
      collection.find().toArray(function(err, results){
          if(err) throw err;
          db.close();
      });
    });
  });
});

router.route('/courses/:coursecode')

  .get(function(req, res){
    //retrieve requested file from mongodb
    MongoClient.connect(mongoUri, function(err, db){
        if(err) throw err;
        var collection = db.collection('test_insert');
        collection.find().toArray(function(err, results){
            res.json(results);
            db.close();
        });
    });
  });

app.use('/api', router);

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
