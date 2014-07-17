(function(){
  var quizHoursApp = angular.module('quizHoursApp',[]);

  quizHoursApp.controller('QuizCtrl', function($scope){
      $scope.course = temp;
      $scope.quizSelected = 0;
      $scope.questionSelected = 0;
      $scope.currentQuestion = $scope.course.quizzes[$scope.quizSelected][$scope.questionSelected];
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
  });
  

  var temp = {
  "classcode": "vadim1337",
  "name": "CME100",
  "password": "testing007",
  "quizzes": [[
    {
      "concept": "The concept of the question.",
      "question": "Ask le question",
      "answers": [
        {
          "content": "Right answer! :D", 
          "isCorrect": true
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        }
      ],
      "hint": "Hint goes here",
      "explanation": "Why is the right answer right"
    },
    {
      "concept": "Addition",
      "question": "What is 1 + 1?",
      "answers": [
        {
          "content": 1, 
          "isCorrect": false
        },
        {
          "content": 2, 
          "isCorrect": true
        },
        {
          "content": 3, 
          "isCorrect": false
        },
        {
          "content": 4, 
          "isCorrect": false
        }
      ],
      "hint": "Try 4 - 2!",
      "explanation": "One stick and one stick makes two sticks."
    }
  ],
  [
    {
      "concept": "Multiplication",
      "question": "What is 2 * 2?",
      "answers": [
        {
          "content": "Right answer! :D", 
          "isCorrect": true
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        }
      ],
      "hint": "Try 6 - 2!",
      "explanation": "Add two to two."
    },
    {
      "concept": "Division",
      "question": "What is 6 / 2?",
      "answers": [
        {
          "content": "Right answer! :D", 
          "isCorrect": true
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        },
        {
          "content": "Wrong answer", 
          "isCorrect": false
        }
      ],
      "hint": "Try 4 - 1!",
      "explanation": "Six sticks, take away half of them."
    }
  ]]
};
})();
