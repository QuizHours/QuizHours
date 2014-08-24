var WebSocketServer = require('ws').Server,
  MongoClient = require('mongodb').MongoClient,
  bodyParser = require('body-parser'),
  fs = require('fs'),
	http = require('http'),
	path = require('path'),
	express = require('express'),
	app = express(),
	port = process.env.PORT || 5000,
	mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost:27017',
	mongoName = 'courses',
  router = express.Router();
  
MongoClient.connect(mongoUri, function(err, db){
  if(err) throw err;
  db.collection(mongoName).drop(); //clear collection for time being while testing
  var collection = db.collection(mongoName);
  var filename = 'course-template1.json';
  fs.readFile(path.join(process.cwd(), '/data/courses/'+filename), 'utf8', function(err, data){
    var initialCourse;
    if(err){
      console.log('error reading from file');
      return;
    } else {
      data = data.split("\\").join("\\\\");
      initialCourse = JSON.parse(data);
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
    MongoClient.connect(mongoUri, function(conErr, db){
        if(conErr) {
          res.send(conErr);
          throw conErr;
        }
        var collection = db.collection(mongoName);
        collection.find({"classcode": req.params.coursecode}).toArray(function(findErr, results){
            if(findErr) {
              res.send(findErr);
              throw findErr;
            }
            res.json(results);
            db.close();
        });
    });
  })
  
  .post(function(req, res){
      var courseData = req.body.course;
      MongoClient.connect(mongoUri, function(conErr, db){
          if(conErr) {
            res.send(conErr);
            throw conErr;
          }
          var collection = db.collection(mongoName);
          collection.insert(courseData, function(insertErr, docs){
              if(insertErr){
                res.send(insertErr);
                throw insertErr;
              }
              res.json({"result": "success"});
              db.close();
          });
      });
  });

app.use(bodyParser.json());
  
app.use('/api', router);

// Hack to control api endpoint between development and production
app.get('/js/quiz.js', function(request, response){
    var course_uri = "'" + (port == 5000 ? "http://localhost:5000" : "http://quizhours.herokuapp.com");
    course_uri += "/api/courses/vadim1337" + "'";
    fs.readFile('public/javascripts/quiz.js', 'utf8', function(err, data){
        if(err) {
          response.send(err);
        } else {
          data = data.replace("${$URI_HOOK$}$", course_uri);
          response.send(data);
        }
    });
});

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(port);
