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

        $('.question-display').hide();
        $('.question-edit').hide();
        $('#save-question-btn').hide();
        $('#delete-question-btn').hide();
        $('#save-all-changes-btn').hide();
        load_course_data();
    });
    
    function refresh_mathjax() {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
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
            var index = $(this).val();
            if(index !== 'default'){
              var questionSelect = $('.question-select');
              var questionList = data.quizzes[index];
              $.each(questionList, function(index, question){
                  questionSelect.append('<option value="'+index+'">'+question.concept+'</option>');
              });
            }
        });
        
        // EL for selecting a different question
        $('.question-select').change(function(e){
            var index = $(this).val();
            var quizIndex = $('.quiz-select').val();
            if(index !== 'default'){
              var questionDisplay = $('.question-display');
              var questionEdit = $('.question-edit');
              var questionList = data.quizzes[quizIndex];
              var question = questionList[index];
              
              // Clear question display view
              questionDisplay.find('h3').html("");
              questionDisplay.find('p').html("");
              questionDisplay.find('ul').html("");
              questionDisplay.find('.hint-box').html("");
              questionDisplay.find('.explanation-box').html("");

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
              /*questionEdit.find('#concept-edit').val("");
              questionEdit.find('#question-text-edit').val("");
              questionEdit.find('.answer-edit-box').html("");
              questionEdit.find('#hint-edit').val("");
              questionEdit.find('#explanation-edit').val("");*/

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
            var quizIndex = $('.quiz-select').val();
            var questionIndex = $('.question-select').val();
            var questionList = data.quizzes[quizIndex];
            var question = questionList[questionIndex];
            
            question.concept = $('#concept-edit').val();
            question.question = $('#question-text-edit').val();
            $('.answer-edit').each(function(index){
                question.answers[index]['content'] = $(this).val();
                question.answers[index]['isCorrect'] = false;
            });
            $('.answer-iscorrect-edit:checked').each(function(index){
                question.answers[$(this).val()]['isCorrect'] = true;
            });
            question.hint = $('#hint-edit').val();
            question.explanation = $('#explanation-edit').val();
            
            data.quizzes[quizIndex][questionIndex] = question;
            $('#save-all-changes-btn').show();
        });
        
        $('#delete-question-btn').click(function(e){
            e.preventDefault();
            var quizIndex = $('.quiz-select').val();
            var questionIndex = $('.question-select').val();
            var questionList = data.quizzes[quizIndex];
            var newQuestionIndex = (parseInt($('.question-select').val()) + 1) % ($('.question-select > option').size() - 1);
            console.log('Delete button clicked!');
            console.log(parseInt($('.question-select').val())+1);
            console.log($('.question-select > option').size()-1);
            console.log(newQuestionIndex);
            //var question = questionList[questionIndex];
            //data.quizzes[quizIndex][questionIndex] = {};
            //data.quizzes[quizIndex] = questionList.splice(questionIndex, 1);
            $('.question-select').val(newQuestionIndex);
            $('.question-select').change();
        });
        
        
        $('#save-all-changes-btn').click(function(e){
            e.preventDefault();
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
