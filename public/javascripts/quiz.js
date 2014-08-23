//Global variables for AJAX request and response
var ajax_url = 'http://localhost:5000/api/courses/vadim1337';
//var ajax_url = 'http://quizhours.herokuapp.com//api/courses/vadim1337';
var data;

$(document).ready(function() {
	//MathJax Configuration for inline display
	MathJax.Hub.Config({tex2jax: {
		inlineMath: [ ['$','$'], ['\\(','\\)'] ]
 	}});

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
		//Store the response globally
		data = response[0];
		publish_all_quizzes();	
	});
}

/*
*Publishes a list of all available quizzes.
*Shows details of first quiz by default
*/
function publish_all_quizzes() {
	/*
	*Publish the questions in reverse order, so that when they
	*are floated left, they are in the correct order.
	*/
	for(var i = data.quizzes.length - 1; i >= 0; i--) {
		$(".quiz_list").append("<div class = 'quiz_item' quiz_id = '"+i+"'> Quiz "+(i+1)+"</div>");
	}

	//Displays data for the first quiz by default
	$(".quiz_item").last().addClass("active");
	publish_question_list(data.quizzes[0]);

	//On clicking a quiz, display question list of that quiz
	$(".quiz_item").click(function() {
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
		$(".question_list").append("<div class = 'q_list_q' question_id = '"+i+"'>"+question.concept+"</div>");
	});

	//Show first question by default
	publish_question(quiz_data[0]);

	//On clicking a question, display it
	$(".q_list_q").click(function() {
		var question_id = $(this).attr("question_id");
		publish_question(quiz_data[question_id]);
	});
}

function publish_question(question_data) {
	//Clear current content
	$(".question_display").empty();

	//Publish the question
	$(".question_display").append("<div>"+question_data.question+"</div>");

	//Publish each of the answers
	$.each(question_data.answers, function(i, answer) {
		$(".question_display").append("<div class = 'answers' answer_id = '"+ i +"'>"+answer.content+"</div>");
	});

	//Space for the hint/explanation
	$(".question_display").append("<div class = 'hints'></div>")
	refresh_mathjax();

	$(".answers").click(function() {
		var answer_id = $(this).attr("answer_id");

		//Clear any current hints
		$(".hints").empty()

		//If answer is right, give explanation
		//Else, give hint		
		if(question_data.answers[answer_id].isCorrect)
			$(".hints").append("<div>"+question_data.explanation+"</div>");
		else
			$(".hints").append("<div>"+question_data.hint+"</div>");
	});
}

function refresh_mathjax() {
	MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}