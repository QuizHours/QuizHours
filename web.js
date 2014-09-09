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
            /*if(typeof(results) == 'string')
              results = JSON.parse(results);
            var sanitizedResults = {};
            sanitizedResults.classcode = results.classcode;
            sanitizedResults.name = results.name;
            sanitizedResults.quizzes = results.quizzes;*/
            // TODO: PATCH THIS SECURITY HOLE
            var sanitizedResults = results;
            res.json(sanitizedResults);
            db.close();
        });
    });
  })
  
  /*.post(function(req, res){
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
  });*/

app.use(bodyParser.json());
  
app.use('/api', router);

// Every extension handled by app.VERB is functionality for the webapp

app.get('/quiz', function(request, response){
    var classcode = request.query.classcode;
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
app.get('/js/quiz.js', function(request, response){
    var course_uri = (port == 5000 ? "http://localhost:5000" : "http://quizhours.herokuapp.com");
    course_uri += "/api/courses/" + request.query.classcode;
    fs.readFile('public/javascripts/quiz.js', 'utf8', function(err, file){
        if(err) {
        } else {
          var context = {"uriHook": course_uri};
          response.send(compileHandlebars(file, context));
    });
});

// Hack, replace with templating
app.get('/quizbuilder', function(request, response){
    var classcode = request.query.classcode;
    // TODO: add code to check for classcode, return error if not present/valid
    fs.readFile('quizbuilder/quizbuilder.html', 'utf8', function(err, file){
        if(err){
        } else {
          file = file.replace("${$CLASSCODE_HOOK$}$", classcode);
          response.send(file);
        }
    });
});

// Hack, replace with templating
app.get('/quizbuilder/quizbuilder.js', function(request, response){
    var course_uri = "'" + (port == 5000 ? "http://localhost:5000" : "http://quizhours.herokuapp.com");
    course_uri += "/api/courses/" + request.query.classcode + "'";
    fs.readFile('quizbuilder/quizbuilder.js', 'utf8', function(err, file){
        if(err) {
          //res.send(err);
        } else {
          file = file.replace("${$URI_HOOK$}$", course_uri);
          response.send(file);
        }
    });
});

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(port);
