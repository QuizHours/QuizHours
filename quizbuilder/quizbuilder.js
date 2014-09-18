(function(){
    /* Global veriables for AJAX request and response */
    var ajax_url = '{{uriHook}}'; /* Environment specific: prod vs dev */
    var data;
    $(document).ready(function(){
        /* MathJax Confguration for inline disply and to hide all messages */
        MathJax.Hub.Config({
            tex2jax: {
              inlineMath: [ ['$','$'], ['\\(','\\)'] ]
            },
            messageStyle: "none"
        });

        $('.question-select').hide();
        $('.question-display').hide();
        $('.question-edit').hide();
        $('#delete-quiz-btn').hide();
        $('#save-question-btn').hide();
        $('#delete-question-btn').hide();
        $('#save-all-changes-btn').hide();
        load_course_data();
    });
    
    function refresh_mathjax() {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }
    
    // Convenience function for parsing int
    function pInt(numStr){
      return parseInt(numStr, 10);
    }

    function clearQuestionDisplay(){
      var questionDisplay = $('.question-display');
      questionDisplay.find('h3').html("");
      questionDisplay.find('p').html("");
      questionDisplay.find('ul').html("");
      questionDisplay.find('.hint-box').html("");
      questionDisplay.find('.explanation-box').html("");
    }

    function clearQuestionEdit(){
      var questionEdit = $('.question-edit');
      questionEdit.html("");
      questionEdit.append('<h2>Edit Question:</h2>');
      questionEdit.append('<label>Concept: <input type="text" id="concept-edit" /></label><br />');
      questionEdit.append('<label>Question:<br />');
      questionEdit.append('<textarea id="question-text-edit" /></textarea></label>');
      questionEdit.append('<div class="answer-edit-box"></div>');
      questionEdit.append('<label>Hint:<br />');
      questionEdit.append('<textarea id="hint-edit"></textarea></label><br />');
      questionEdit.append('<label>Explanation:<br />');
      questionEdit.append('<textarea id="explanation-edit"></textarea></label>');
    }

    /* 
     * Makes an AJAX call as soon as the page has loaded to get all course data.
     * Stores response as a global JSON object.
     */
     function load_course_data() {
       $.ajax({ 
        url: ajax_url 
       }).done(function(response){
         /* Store the response globally */
         data = response;
         publish_all_quizzes();
         register_event_listeners();
       }).fail(function(){
         $(".question_display").append("<div class = 'displayed_concept'>Something went wrong and no quizzes were loaded. Please report this issue to dev@quizhours.com</div>");
       });
     }
     
     /*
      * Publishes a list of all available quizzes.
      */
      function publish_all_quizzes() {
        var quizzes = data.quizzes;
        $.each(quizzes, function(index, value){
              $('.quiz-select').append('<option value="'+index+'">'+(index+1)+'</option>');
        });
      }
      
      function register_event_listeners(){
        // EL for selecting a different quiz
        $('.quiz-select').change(function(e){
            var index = pInt($(this).val());
            if(index !== 'default'){
              var questionList = data.quizzes[index];
              var questionSelect = $('.question-select');
              questionSelect.show();
              questionSelect.html("<option value=\"default\">Select a question...</option>");
              $.each(questionList, function(index, question){
                  questionSelect.append('<option value="'+index+'">'+question.concept+'</option>');
              });
              $('#delete-quiz-btn').show();
            }
        });
        
        // EL for selecting a different question
        $('.question-select').change(function(e){
            var index = pInt($(this).val());
            var quizIndex = pInt($('.quiz-select').val());
            if(index !== 'default'){
              var questionDisplay = $('.question-display');
              var questionEdit = $('.question-edit');
              var questionList = data.quizzes[quizIndex];
              var question = questionList[index];
              
              // Clear question display view
              clearQuestionDisplay();

              // Render question display view
              questionDisplay.find('h3').html(question.concept);
              questionDisplay.find('p').html(question.question);
              var answersDisplay = questionDisplay.find('ul');
              //answersDisplay.html("");
              $.each(question.answers, function(index, answer){
                  answersDisplay.append('<li style="list-style-type: none;" class="answer">'+answer.content+'</li>');
              });
              questionDisplay.find('.hint-box').html(question.hint);
              questionDisplay.find('.explanation-box').html(question.explanation);
              refresh_mathjax(); // Refresh mathjax BEFORE rendering question edit view
              
              // Clear question edit view
              clearQuestionEdit();

              // Render question edit view
              questionEdit.find('#concept-edit').val(question.concept);
              questionEdit.find('#question-text-edit').val(question.question);
              var answersEdit = questionEdit.find('.answer-edit-box');
              answersEdit.html("");
              $.each(question.answers, function(index, answer){
                  answersEdit.append('<label>Answer '+(index+1)+': <input type="text" class="answer-edit" value="'+answer.content+'" />'+
                    '<input type="checkbox" class="answer-iscorrect-edit" value="'+index+'" '+(answer.isCorrect ? "checked='checked'" : "")+'/></label><br />');
              });
              questionEdit.find('#hint-edit').val(question.hint);
              questionEdit.find('#explanation-edit').val(question.explanation);

              // Display views and controls
              $('.question-display').show();
              $('.question-edit').show();
              $('#save-question-btn').show();
              $('#delete-question-btn').show();
              
            }
        });
        
        // EL for saving a question locally
        $('#save-question-btn').click(function(e){
            e.preventDefault();
            var quizIndex = pInt($('.quiz-select').val());
            var questionIndex = pInt($('.question-select').val());
            var questionList = data.quizzes[quizIndex];
            var question = questionList[questionIndex];
            
            question.concept = $('#concept-edit').val();
            question.question = $('#question-text-edit').val();
            $('.answer-edit').each(function(index){
                question.answers[index]['content'] = $(this).val();
                question.answers[index]['isCorrect'] = false;
            });
            $('.answer-iscorrect-edit:checked').each(function(index){
                question.answers[pInt($(this).val())]['isCorrect'] = true;
            });
            question.hint = $('#hint-edit').val();
            question.explanation = $('#explanation-edit').val();
            
            $('.question-select > option[value='+questionIndex+']').html(question.concept);
            data.quizzes[quizIndex][questionIndex] = question;
            $('#save-all-changes-btn').show();
        });
        
        // EL for deleting a question locally
        $('#delete-question-btn').click(function(e){
            e.preventDefault();
            var quizIndex = pInt($('.quiz-select').val());
            var questionIndex = pInt($('.question-select').val());
            var questionList = data.quizzes[quizIndex];
            //var newQuestionIndex = (questionIndex + 1) % ($('.question-select > option').size() - 1);
            $('.question-select > option[value='+questionIndex+']').remove();
            clearQuestionDisplay();
            $('.question-edit').html("");
            $('#save-question-btn').hide();
            $('#delete-question-btn').hide();
            $('#save-all-changes-btn').show();
            data.quizzes[quizIndex][questionIndex] = null;
        });
        
        // EL for deleting a quiz locally
        $('#delete-quiz-btn').click(function(e){
            e.preventDefault();
            var quizIndex = pInt($('.quiz-select').val());
            var numQuestions = data.quizzes[quizIndex].length;
            for(var i = 0; i < numQuestions; i++){
              $('.question-select > option[value='+i+']').remove();
            }
            $('.quiz-select > option[value='+quizIndex+']').remove();
            clearQuestionDisplay();
            $('.question-edit').html("");
            $('#save-question-btn').hide();
            $('#delete-question-btn').hide();
            $('#save-all-changes-btn').show();
            data.quizzes[quizIndex] = null;
        });
        
        // Commit all local changes by sending them to the server
        $('#save-all-changes-btn').click(function(e){
            e.preventDefault();

            // Scrub out all deleted questions and quizzes (marked with null)
            var newQuizzes = [];
            $.each(data.quizzes, function(index, quiz){
              if(quiz !== null){
                console.log(quiz);
                var newQuestions = [];
                $.each(quiz, function(index, question){
                  if(question !== null){
                    console.log(question);
                    newQuestions.push(question);
                  }
                });
                quiz = newQuestions;
                newQuizzes.push(quiz);
              }
            });
            data.quizzes = newQuizzes;
            console.log(data);

            // Send request to server
            $.ajax({
                type: "PUT", // Possible cross-browser compatibility issues
                contentType: "application/json", 
                url: ajax_url,
                data: JSON.stringify({"data": data})
            }).done(function(results){
                // Hack to quickly propagate changes to qb view
                location.reload(); // doesn't force reload without cache; possible problem
            }).fail(function(){
                $(".question_display").append("<div class = 'displayed_concept'>Your quiz could not be saved. Please report this issue to dev@quizhours.com</div>");
            });
        });
      }
})();
