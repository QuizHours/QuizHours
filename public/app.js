(function(){
  var quizHoursApp = angular.module('quizHoursApp',[]);

  var mathjax = 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
  quizHoursApp.controller('QuizCtrl', ['$scope', '$http', function($scope, $http){
      $http.get('http://quizhours.herokuapp.com/api/courses/vadim1337').success(function(data){
          console.log(data);
          if(typeof(data) == 'string'){
            $scope.course = JSON.parse(data);
          } else {
            $scope.course = data;
          }
          $scope.mathjax = mathjax;
          $scope.course = $scope.course[0];
          $scope.quizSelected = 0;
          $scope.questionSelected = 0;
          $scope.answerResponse = '';
          $scope.currentAnswer = {};
          $scope.currentQuiz = $scope.course.quizzes[$scope.quizSelected];
          $scope.currentQuestion = $scope.currentQuiz[$scope.questionSelected];
      });
      $scope.setQuiz = function(quizIndex){
        $scope.setCurrentQuestion(quizIndex, 0);
      };
      $scope.setQuestion = function(questionIndex){
        $scope.setCurrentQuestion($scope.quizSelected, questionIndex);
      };
      $scope.setCurrentQuestion = function(quizIndex, questionIndex){
        $scope.currentAnswer = {};  //Clear previous answer for new question
        $scope.quizSelected = quizIndex;
        $scope.questionSelected = questionIndex;
        $scope.currentQuestion = $scope.course.quizzes[quizIndex][questionIndex];
      };
      $scope.selectAnswer = function(answerIndex){
        $scope.currentAnswer = {};  //Clear previous answer
        $scope.currentAnswer = $scope.currentQuestion.answers[answerIndex];
        if ($scope.currentAnswer.isCorrect){
          $scope.answerResponse = $scope.currentQuestion.explanation;
          
        } else {
          $scope.answerResponse = $scope.currentQuestion.hint;
        }
      };
  }]);
  
})();
