(function(){
  var quizHoursApp = angular.module('quizHoursApp',[]);

  var MATHJAX_SOURCE = 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
  //var quizhoursUri = 'http://quizhours.herokuapp.com/api/courses/vadim1337';
  var quizhoursUri = 'http://localhost:5000/api/courses/vadim1337';
  
  quizHoursApp.controller('QuizCtrl', ['$scope', '$http', function($scope, $http){
      //$http.get('http://quizhours.herokuapp.com/api/courses/vadim1337').success(function(data){
        $http.get(quizhoursUri).success(function(data){
          console.log(data);
          if(typeof(data) == 'string'){
            $scope.course = JSON.parse(data);
          } else {
            $scope.course = data;
          }
          //$scope.mathjax = mathjax;
          $scope.course = $scope.course[0];
          /*$scope.quizSelected = 0;
          $scope.questionSelected = 0;
          $scope.answerResponse = '';
          $scope.currentAnswer = {};
          $scope.currentQuiz = $scope.course.quizzes[$scope.quizSelected];
          $scope.currentQuestion = $scope.currentQuiz[$scope.questionSelected];*/
          $scope.setCurrentQuestion(0,0);
      });
      $scope.setQuiz = function(quizIndex){
        $scope.setCurrentQuestion(quizIndex, 0);
      };
      $scope.setQuestion = function(questionIndex){
        $scope.setCurrentQuestion($scope.quizSelected, questionIndex);
      };
      $scope.setCurrentQuestion = function(quizIndex, questionIndex){
        $scope.currentAnswer = {};  //Clear previous answer for new question
        $scope.answerResponse = '';
        $scope.quizSelected = quizIndex;
        $scope.questionSelected = questionIndex;
        $scope.currentQuestion = $scope.course.quizzes[quizIndex][questionIndex];
        $scope.currentQuestion.question = $scope.clean_latex($scope.currentQuestion.question);
        var cleanedAnswers = [];
        $scope.currentQuestion.answers.forEach(function(element, index, array){
            var cleanedAnswer = element;
            cleanedAnswer["content"] = $scope.clean_latex(cleanedAnswer["content"]);
            cleanedAnswers.push(cleanedAnswer);
        });
        $scope.currentQuestion.answers = cleanedAnswers;
      };
      $scope.selectAnswer = function(answerIndex){
        $scope.currentAnswer = {};  //Clear previous answer
        $scope.currentAnswer = $scope.currentQuestion.answers[answerIndex];
        if ($scope.currentAnswer.isCorrect){
          $scope.answerResponse = $scope.currentQuestion.explanation;
          
        } else {
          $scope.answerResponse = $scope.currentQuestion.hint;
        }
        $scope.answerResponse = $scope.clean_latex($scope.answerResponse);
      };
      $scope.load_mathjax = function() {
         var tag = document.createElement('script');
         alert("REMOVING MATHJAX");
         $(".matjax_script").remove();
         tag.className = "matjax_script";
           tag.src = MATHJAX_SOURCE;
           var firstScriptTag = document.getElementsByTagName('script')[0];
           alert("ADDING MATHJAX");
           firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      //function to parse common LaTeX dollar signs into mathjax-friendly parens
      $scope.clean_latex = function(latex){
        var inExpression = false;
        var cleanedLatex = "";
        var latexLength = latex.length;
        for(var i = 0; i < latexLength; i++){
          if(latex.charAt(i) == '$'){
            if(!inExpression){
              cleanedLatex = cleanedLatex + "\\(";
              inExpression = true;
            } else {
              cleanedLatex = cleanedLatex + "\\)";
              inExpression = false;
            }
          } else {
            cleanedLatex = cleanedLatex + latex[i];
          }
        }
        return cleanedLatex;
      }
  }]);
})();
