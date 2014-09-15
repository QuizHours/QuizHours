var WebSocketServer = require('ws').Server,
  MongoClient = require('mongodb').MongoClient,
  bodyParser = require('body-parser'),
  fs = require('fs'),
	http = require('http'),
	path = require('path'),
	Handlebars = require('handlebars'),
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

function compileHandlebars(inputString, context){
  var template = Handlebars.compile(inputString);
  return template(context);
}

// Every extension handled by router involves QuizHours API

// Course data (GET/CREATE/UPDATE/DELETE course)
router.route('/courses/:classcode')

  .get(function(req, res){
    //retrieve requested file from mongodb
    MongoClient.connect(mongoUri, function(conErr, db){
        if(conErr) {
          res.send(conErr);
          throw conErr;
        }
        var collection = db.collection(mongoName);
        collection.find({"classcode": req.params.classcode}).toArray(function(findErr, results){
            if(findErr) {
              res.send(findErr);
              throw findErr;
            }
            /*if(typeof(results) == 'string')
              results = JSON.parse(results);
            var sanitizedResults = {};
            sanitizedResults.classcode = results.classcode;
            sanitizedResults.name = results.name;
            sanitizedResults.quizzes = results.quizzes;*/
            // TODO: PATCH THIS SECURITY HOLE
            //var sanitizedResults = results;
            //res.json(sanitizedResults);
            results = results[0];
            delete results.password;
            delete results._id;
            res.json(results);
            db.close();
        });
    });
  })
  
  //create new file in mongodb
  .post(function(req, res){
      var courseData = req.body;
      res.send(courseData);
      /*MongoClient.connect(mongoUri, function(conErr, db){
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
      });*/
  })
  
  //update file in mongodb
  .put(function(req, res){
      var courseData = req.body;
      MongoClient.connect(mongoUri, function(conErr, db){
          if(conErr) {
            res.send(conErr);
            throw conErr;
          }
          var collection = db.collection(mongoName);
          // We use "$set" when passing in data to prevent overwriting password
          collection.findAndModify({"classcode": req.params.classcode}, 
                                   [['_id', 'asc']],
                                   {"$set": courseData}, 
                                   {},
          function(err, object){
              if(err){
                res.send(err);
              } else {
                res.send(object); // NOTE: passes back pre-modification file!
              }
              db.close();
          });
      });
  });
  
// "50mb" is a hack to overcome Error 413 "Entity too large"
// Is there a better solution?
app.use(bodyParser.urlencoded({extended:true, limit:'50mb'}));

app.use('/api', router);

// Every extension handled by app.VERB is functionality for the webapp

app.get('/course/:classcode', function(request, response){
    var classcode = request.params.classcode;
    // TODO: add code to check for classcode, return error if not present/valid
    fs.readFile('public/quiz.html', 'utf8', function(err, file){
        if(err){
        } else {
          var context = {"classcode": classcode};
          response.send(compileHandlebars(file, context));
        }
    });
});

// Hack to control api endpoint between development and production
app.get('/js/:classcode/quiz.js', function(request, response){
    var course_uri = (port == 5000 ? "http://localhost:5000" : "http://quizhours.herokuapp.com");
    course_uri += "/api/courses/" + request.params.classcode;
    fs.readFile('public/javascripts/quiz.js', 'utf8', function(err, file){
        if(err) {
        } else {
          var context = {"uriHook": course_uri};
          response.send(compileHandlebars(file, context));
        }
    });
});

app.get('/qb/course/:classcode', function(request, response){
    var classcode = request.params.classcode;
    // TODO: add code to check for classcode, return error if not present/valid
    fs.readFile('quizbuilder/quizbuilder.html', 'utf8', function(err, file){
        if(err){
        } else {
          var context = {"classcode": classcode};
          response.send(compileHandlebars(file, context));
        }
    });
});

app.get('/qb/js/:classcode', function(request, response){
    var course_uri = (port == 5000 ? "http://localhost:5000" : "http://quizhours.herokuapp.com");
    course_uri += "/api/courses/" + request.params.classcode;
    fs.readFile('quizbuilder/quizbuilder.js', 'utf8', function(err, file){
        if(err) {
        } else {
          var context = {"uriHook": course_uri};
          response.send(compileHandlebars(file, context));
        }
    });
});

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(port);
