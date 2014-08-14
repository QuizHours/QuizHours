//Global variables for AJAX request and response
var ajax_url = 'http://localhost:5000/api/courses/vadim1337';
var data;

$(document).ready(function() {
	//MathJax Configuration for inline display
	MathJax.Hub.Config({tex2jax: {
		inlineMath: [ ['$','$'], ['\\(','\\)'] ]
 	}});

	//load_course_data();
	$.ajax({
		url: ajax_url
	}).success(function(response){
		//Parse and store the response globally
		data = typeof(response) == 'string' ? JSON.parse(response) : response;
		data = data[0];
		publish_all_quizzes();
	});
		
});

/*
*Publishes a list of all available quizzes.
*Shows details of first quiz by default
*/
function publish_all_quizzes() {
	$.each(data.quizzes, function(i, quiz) {
	    $(".quiz_list").append("<li class='quiz_item' quiz_id = '"+i+"'><a href='#quiz"+(i+1)+"'>Quiz "+(i+1)+"</a></li>");
	});

	//Displays data for the first quiz by default
	publish_question_list(data.quizzes[0]);

	//On clicking a quiz, display question list of that quiz
	$(".quiz_item").click(function() {
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
		$(".question_list").append("<li class='q_list_q' question_id='"+i+"'><a>"+question.concept+"</a></li>");
	});

	//Show first question by default
	$(".q_list_q").first().addClass('active');
	publish_question(quiz_data[0]);

	//On clicking a question, display it
	$(".q_list_q").click(function() {
		var question_id = $(this).attr("question_id");
		$(".active").removeClass("active");
		$(this).addClass("active");
		publish_question(quiz_data[question_id]);
	});
}

function publish_question(question_data) {
	//Clear current content
	$(".question_display").empty();

	$(".question_display").append("<h1>"+question_data.concept+"</h1>");
	
	//Publish the question
	$(".question_display").append("<p>"+question_data.question+"</p>");

	$(".question_display").append("<ul></ul>");
	
	//Publish each of the answers
	$.each(question_data.answers, function(i, answer) {
		$(".question_display > ul").append("<li class='answer btn btn-default' answer_id='"+i+"'>"+answer.content+"</li>");
	});

	//Space for the hint/explanation
	$(".question_display").append("<div class = 'hints'></div>")
	refresh_mathjax();

	$(".answer").click(function() {
		var answer_id = $(this).attr("answer_id");

		// reset all previous answers
		$(".answer").removeClass().addClass("answer btn btn-default");
		
		//Clear any current hints
		$(".hints").empty()

		//If answer is right, give explanation
		//Else, give hint		
		if(question_data.answers[answer_id].isCorrect){
		  $(this).removeClass().addClass('answer btn btn-success');
			$(".hints").append("<p id='answer-response'>"+question_data.explanation+"</p>");
		} else {
		  $(this).removeClass().addClass('answer btn btn-danger');
			$(".hints").append("<p id='answer-response'>"+question_data.hint+"</p>");
		}
		refresh_mathjax();  //necessary because of possible LaTeX in the explanation/hint
	});
}

function refresh_mathjax() {
	MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}