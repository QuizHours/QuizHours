(function(){
  var quizHoursApp = angular.module('quizHoursApp',[]);

  quizHoursApp.controller('QuizCtrl', ['$scope', '$http', function($scope, $http){
      $http.get('../data/courses/cme100_summer2014.json').success(function(data){
          $scope.course = data;
          $scope.quizSelected = 0;
          $scope.questionSelected = 0;
          $scope.currentQuestion = $scope.course.quizzes[$scope.quizSelected][$scope.questionSelected];
      });
      $scope.setQuiz = function(index){
        $scope.quizSelected = index;
        $scope.setCurrentQuestion(index, 0);
      };
      $scope.setQuestion = function(index){
        $scope.questionSelected = index;
        $scope.setCurrentQuestion($scope.quizSelected, index);
      };
      $scope.setCurrentQuestion = function(quizIndex, questionIndex){
        $scope.currentQuestion = $scope.course.quizzes[quizIndex][questionIndex];
      };
      
  }]);
  
})();
