(function(){
  /*Global variables for AJAX request and response*/
var ajax_url = '{{uriHook}}'; /* Environment specific: prod vs dev*/
var data;

// An empty sample question
var empty_question = {
            answers: [{
                content: "Correct",
                isCorrect: true
            },{
                content: "Wrong",
                isCorrect: false
            },{
                content: "Wrong",
                isCorrect: false
            },{
                content: "Wrong",
                isCorrect: false
            }],
            concept: "Concept Here",
            explanation: "Explanation Here",
            hint: "Hint Here",
            question: "Question Here"
        }

// Empty quiz
var empty_quiz = [empty_question];

$(document).ready(function() {
    /*MathJax Configuration for inline display
    and to hide all messages */
    MathJax.Hub.Config({tex2jax: {
        inlineMath: [ ['$','$'], ['\\(','\\)'] ]},
        messageStyle: "none"});

    load_course_data();
    add_button_events();
});

/*
*Makes an AJAX call as soon as the page has loaded
*to get all course data. Stores response as a
*global JSON object.
*/
function load_course_data() {
    $.ajax({
        url: ajax_url
    }).done(function(response){
        /*Store the response globally*/
        data = response;
        publish_all_quizzes();  
    }).fail(function(){
        /*Fail gracefully if no quizzes were loaded*/
        $(".question_display").append("<div class = 'displayed_concept'>Something went wrong and no quizzes were loaded. Please recheck the class code you entered or report this issue to dev@quizhours.com</div>");
    });
}

/*
* Adds events to the buttons at the bottom corner 
* to save and delete
*/
function add_button_events() {
    $("#save_all").click(function() {
        $.ajax({
            type: "PUT", // Possible cross-browser compatibility issues
            contentType: "application/json", 
            url: ajax_url,
            data: JSON.stringify({"data": data})
        }).done(function(results){
            // Hack to quickly propagate changes to qb view
            location.reload(); // doesn't force reload without cache; possible problem
        }).fail(function(){
            alert("Your quiz could not be saved. Please report this issue to dev@quizhours.com");
        });
    });

    $("#question_save").click(function() {
        // Get quiz and question id
        var quiz_id = $(".quiz_item.active").attr("quiz_id");
        var question_id = $(".question_list_item.question_active").attr("question_id");

        // Build modified quiz object
        modified_quiz = {
            answers: [{
                content: $("#edit_answer0").val(),
                isCorrect: $("#isCorrect0").prop("checked")
            },{
                content: $("#edit_answer1").val(),
                isCorrect: $("#isCorrect1").prop("checked")
            },{
                content: $("#edit_answer2").val(),
                isCorrect: $("#isCorrect2").prop("checked")
            },{
                content: $("#edit_answer3").val(),
                isCorrect: $("#isCorrect3").prop("checked")
            }],
            concept: $("#edit_concept").val(),
            explanation: $("#edit_explanation").val(),
            hint: $("#edit_hint").val(),
            question: $("#edit_question").val()
        }

        // Insert modified quiz and reload
        data.quizzes[quiz_id][question_id] = modified_quiz;
        publish_question(data.quizzes[quiz_id][question_id]);
    });

    $("#question_delete").click(function() {
        // Get quiz and question id
        var quiz_id = $(".quiz_item.active").attr("quiz_id");
        var question_id = $(".question_list_item.question_active").attr("question_id");

        //Delete the element and reload
        data.quizzes[quiz_id].splice(question_id, 1);
        publish_question_list(data.quizzes[quiz_id]);
    });

    $("#quiz_delete").click(function() {
        // Get quiz id
        var quiz_id = $(".quiz_item.active").attr("quiz_id");

        // Delete this quiz and reload
        data.quizzes.splice(quiz_id, 1);
        publish_all_quizzes();
    });
}

/*
*Publishes a list of all available quizzes.
*Shows details of first quiz by default
*/
function publish_all_quizzes() {
    $(".quiz_list").empty();
    $(".quiz_list").append("<div class = 'quiz_title'>Quizzes</div>")

    /*Publish all questions*/
    var num_quizzes = data.quizzes.length;
    for(var i = 0; i < num_quizzes; i++)
        $(".quiz_list").append("<div class = 'quiz_item' quiz_id = '"+i+"'> "+(i+1)+"</div>");

    /*If many quizzes present, toggle scrolling*/
    if($(".quiz_list").height() > $(".quiz_list_wrapper").height())
        $(".quiz_list").css({"float": "none", "white-space": "nowrap", "-ms-overflow-style" : "-ms-autohiding-scrollbar;", "overflow-x": "auto"});

    /*Displays data for the first quiz by default*/
    $(".quiz_item").first().addClass("active");
    publish_question_list(data.quizzes[0]);

    /*On clicking a quiz, display question list of that quiz*/
    $(".quiz_item").click(function() {
        /*Update CSS styling*/
        $(".quiz_item").removeClass("active");
        $(this).addClass("active");

        var quiz_id = $(this).attr("quiz_id");
        publish_question_list(data.quizzes[quiz_id]);
    });

    // Button to add a new quiz
    $(".quiz_list").append("<div id = 'add_quiz'>+</div>")
    $("#add_quiz").click(function() {
        // Add an empty quiz, and reload view
        data.quizzes.push(empty_quiz);
        publish_all_quizzes();
    });
}

/*
*Publishes list of all questions in the quiz_data variable
*/
function publish_question_list(quiz_data) {
    $(".question_list").empty();

    $.each(quiz_data, function(i, question) {
        $(".question_list").append("<div class = 'question_list_item' question_id = '"+i+"'>"+question.concept+"</div>");
    });

    /*Show first question by default*/
    $(".question_list_item").first().addClass("question_active");
    publish_question(quiz_data[0]);

    // Add option to create new question
    $(".question_list").append("<div id = 'add_question'>+</div>")
    $("#add_question").click(function() {
        var quiz_id = $(".quiz_item.active").attr("quiz_id");

        // Add an empty question, and reload view
        data.quizzes[quiz_id].push(empty_question);
        publish_question_list(data.quizzes[quiz_id]);
    });

    /*On clicking a question, display it*/
    $(".question_list_item").click(function() {
        /*Update CSS styling*/
        $(".question_list_item").removeClass("question_active");
        $(this).addClass("question_active")
        
        var question_id = $(this).attr("question_id");
        publish_question(quiz_data[question_id]);
    });
}

function publish_question(question_data) {
    /*Clear current content*/
    $(".question_display").empty();

    /*Publish the question*/
    $(".question_display").append("<div class = 'displayed_concept'>"+question_data.concept+"</div>");
    $(".question_display").append("<div class = 'displayed_question'>"+question_data.question+"</div>");
    $(".question_display").append("<div class = 'answers_container'></div>");
    $(".question_display").append("<div class = 'hints'></div>")
    $(".question_display").append("<div class = 'edit_container'></div>");

    /*Publish each of the answers*/
    $.each(question_data.answers, function(i, answer) {
        $(".answers_container").append("<div class = 'answers unattempted' answer_id = '"+ i +"'>"+answer.content+"</div>");
    });

    refresh_mathjax();

    $(".answers").click(function() {
        /*Remove CSS styling on any old attempts*/
        $(".answers").removeClass().addClass("answers unattempted");

        var answer_id = $(this).attr("answer_id");

        /*Clear any current hints*/
        $(".hints").empty();

        /*
         * Add the processing styling to the selected div.
         * Continue processing answer after a timeout of
         * 1000 milliseconds.
         */
        $(this).removeClass("unattempted").addClass("processing");
        setTimeout(function(){
            /*If answer is right, give explanation
              Else, give hint */
            if(question_data.answers[answer_id].isCorrect) {
                $("div[answer_id = "+answer_id+"]").removeClass("processing").addClass("correct");
                $(".hints").append("<div> Explanation: "+question_data.explanation+"</div>");
            }
            else {
                $("div[answer_id = "+answer_id+"]").removeClass("processing").addClass("wrong");
                $(".hints").append("<div> Hint: "+question_data.hint+"</div>");
            }

            refresh_mathjax();
        }, 1000);
    });
    
    build_edit_form(question_data);
}

function build_edit_form(question_data) {
    $(".edit_container").append("<input class = 'major_edit' id = 'edit_concept' value = '" + question_data.concept+ "'></input>");
    $(".edit_container").append("<input class = 'major_edit' id = 'edit_question' value = '" + question_data.question+ "'></input>");

    $(".edit_container").append("<div class = 'answers_edit_container'><input class = 'answers_edit' id = 'edit_answer0' value = '" + question_data.answers[0].content+ "'></input>");
    $(".edit_container").append("<input class = 'answers_edit' id = 'edit_answer1' value = '" + question_data.answers[1].content+ "'></input>");
    $(".edit_container").append("<input class = 'answers_edit' id = 'edit_answer2' value = '" + question_data.answers[2].content+ "'></input>");
    $(".edit_container").append("<input class = 'answers_edit' id = 'edit_answer3' value = '" + question_data.answers[3].content+ "'></input></div>");

    // Build the radio buttons for the correct answer
    $(".edit_container").append("<form id = 'correct_answers'></form>");
    for(var i = 0; i < 4; i++) {
        var radio_button = "<input type = 'radio' name = 'isCorrect' class = 'radio_button' id = 'isCorrect" + i +"' ";
        if(question_data.answers[i].isCorrect) radio_button += "checked";
        radio_button += ">";

        $("#correct_answers").append(radio_button);
    }

    $(".edit_container").append("<input class = 'major_edit' id = 'edit_explanation' value = '" + question_data.explanation+ "'></input>");
    $(".edit_container").append("<input class = 'major_edit' id = 'edit_hint' value = '" + question_data.hint+ "'></input>");
}

function refresh_mathjax() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}
})();