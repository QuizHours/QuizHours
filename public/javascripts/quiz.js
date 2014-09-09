(function(){/*Global variables for AJAX request and response*/
var ajax_url = '{{uriHook}}'; /* Environment specific: prod vs dev*/
var data;

$(document).ready(function() {
	/*MathJax Configuration for inline display
	and to hide all messages */
	MathJax.Hub.Config({tex2jax: {
		inlineMath: [ ['$','$'], ['\\(','\\)'] ]},
		messageStyle: "none"});

	load_course_data();
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
		data = response[0];
		publish_all_quizzes();	
	}).fail(function(){
		$(".question_display").append("<div class = 'displayed_concept'>Something went wrong and no quizzes were loaded. Please report this issue to dev@quizhours.com</div>");
	});
}

/*
*Publishes a list of all available quizzes.
*Shows details of first quiz by default
*/
function publish_all_quizzes() {
	/*Publish all questions*/
	var num_quizzes = data.quizzes.length;
	for(var i = 0; i < num_quizzes; i++)
		$(".quiz_list").append("<div class = 'quiz_item' quiz_id = '"+i+"'> Quiz "+(i+1)+"</div>");

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

	/*Publish each of the answers*/
	$.each(question_data.answers, function(i, answer) {
		$(".answers_container").append("<div class = 'answers unattempted' answer_id = '"+ i +"'>"+answer.content+"</div>");
	});

	/*Space for the hint/explanation*/
	$(".question_display").append("<div class = 'hints'></div>")
	refresh_mathjax();

	$(".answers").click(function() {
		/*Remove CSS styling on any old attempts*/
		$(".answers").removeClass().addClass("answers unattempted");

		var answer_id = $(this).attr("answer_id");

		/*Clear any current hints*/
		$(".hints").empty()

		/*If answer is right, give explanation
		  Else, give hint */
		if(question_data.answers[answer_id].isCorrect) {
			$(this).removeClass("unattempted").addClass("correct");
			$(".hints").append("<div>"+question_data.explanation+"</div>");
		}
		else {
			$(this).removeClass("unattempted").addClass("wrong");
			$(".hints").append("<div>"+question_data.hint+"</div>");
		}

		refresh_mathjax();
	});
}

function refresh_mathjax() {
	MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}
})();