//(function(){
(function(){
console.log("Hello");
})();
    /* Global veriables for AJAX request and response */
    var ajax_url = ${$URI_HOOK$}$; /* Environment specific: prod vs dev */
    var data;
    console.log("in function scope");
    $(document).ready(function(){
        /* MathJax Confguration for inline disply and to hide all messages */
        /*MathJax.Hub.Config({
            tex2jax: {
              inlineMath: [ ['$','$'], ['\\(','\\)'] ]
            },
            messageStyle: "none"
        });*/
        console.log("before load data");
        load_course_data();
    });
    
    /* 
     * Makes an AJAX call as soon as the page has loaded to get all course data.
     * Stores response as a global JSON object.
     */
     function load_course_data() {
       $.ajax({ 
        url: ajax_url 
       }).done(function(response){
         /* Store the response globally */
         console.log(response);
         data = response[0];
         console.log("here");
         console.log(data);
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
            $('.quizzes-container').append('<div id="quiz'+index+'">Quiz '+index+'</div>');
        });
      }
      
      function register_event_listeners(){
      
      }
//})();
