//Global variables for AJAX request and response
var ajax_url = 'http://localhost:5000/api/courses/vadim1337';
var data;

$(document).ready(function() {
	//load_course_data();
	$.ajax({
		url: ajax_url
	}).success(function(response){
		//Parse and store the response globally
		//data = JSON.parse(response);
		data = response;
		publish_all_quizzes();	
	});
	//publish_all_quizzes();	
});

/*
*Publishes a list of all available quizzes.
*Shows details of first quiz by default
*/
function publish_all_quizzes() {
	$.each(data.quizzes, function(i, quiz) {
		$(".quiz_list").append("<div class = 'quiz_item' quiz_id = '"+i+"'> Quiz "+(i+1)+"</div>");
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
*Makes an AJAX call as soon as the page has loaded
*to get all course data. Stores response as a
*global JSON object.
*/
function load_course_data() {
	$.ajax({
		url: ajax_url
	}).success(function(response){
		//Parse and store the response globally
		//data = JSON.parse(response);
		data = response;
	});
	//data = {"_id":"53d7decf0c030a814292e031","classcode":"vadim1337","name":"CME100","password":"testing007","quizzes":[[{"concept":"Vectors in the Plane","question":"Let $$u=(3,-2)$$ and $$v=(-2,5)$$. Find the component form and magnitude of the vector $$w=-2u+5v$$","answers":[{"content":"Right answer","isCorrect":true},{"content":"Wrong answer 1","isCorrect":false},{"content":"Wrong answer 2","isCorrect":false},{"content":"Wrong answer 3","isCorrect":false}],"hint":"Hint goes here","explanation":"Why is the right answer right"},{"concept":"Vectors in the Plane","question":"What is the component form of the unit vector that makes an angle $$2\\pi/3$$ with the positive x-axis?","answers":[{"content":1,"isCorrect":false},{"content":2,"isCorrect":true},{"content":3,"isCorrect":false},{"content":4,"isCorrect":false}],"hint":"Try 4 - 2!","explanation":"One stick and one stick makes two sticks."},{"concept":"Vectors in Space","question":"What is the component form of the vector $$\\vec{P_1P_2}$$ if $$P_1$$ is the point $$(5,7,-1)$$?","answers":[{"content":1,"isCorrect":false},{"content":2,"isCorrect":true},{"content":3,"isCorrect":false},{"content":4,"isCorrect":false}],"hint":"Try 4 - 2!","explanation":"One stick and one stick makes two sticks."},{"concept":"Vectors in Space","question":"What is the component form of the vector $$5u-v$$ if $$u=(1,1,-1)$$ and $$v=(2,0,3)$$?","answers":[{"content":1,"isCorrect":false},{"content":2,"isCorrect":true},{"content":3,"isCorrect":false},{"content":4,"isCorrect":false}],"hint":"Try 4 - 2!","explanation":"One stick and one stick makes two sticks."},{"concept":"Length and Direction","question":"What is the expression of the vector $$9i-2j+6k$$ as a product of its length and direction?","answers":[{"content":1,"isCorrect":false},{"content":2,"isCorrect":true},{"content":3,"isCorrect":false},{"content":4,"isCorrect":false}],"hint":"Try 4 - 2!","explanation":"One stick and one stick makes two sticks."},{"concept":"Length and Direction","question":"What is the vector whose length is $$7$$ and direction is $$-j$$?","answers":[{"content":1,"isCorrect":false},{"content":2,"isCorrect":true},{"content":3,"isCorrect":false},{"content":4,"isCorrect":false}],"hint":"Try 4 - 2!","explanation":"One stick and one stick makes two sticks."},{"concept":"Direction","question":"What is the direction of $$\\vec{P_1P_2}$$, where $$P_1=(3,4,5)$$ and $$P_2=(2,3,4)$$?","answers":[{"content":1,"isCorrect":false},{"content":2,"isCorrect":true},{"content":3,"isCorrect":false},{"content":4,"isCorrect":false}],"hint":"Try 4 - 2!","explanation":"One stick and one stick makes two sticks."}],[{"concept":"Multiplication","question":"What is 2 * 2?","answers":[{"content":"Right answer! :D","isCorrect":true},{"content":"Wrong answer","isCorrect":false},{"content":"Wrong answer","isCorrect":false},{"content":"Wrong answer","isCorrect":false}],"hint":"Try 6 - 2!","explanation":"Add two to two."},{"concept":"Division","question":"What is 6 / 2?","answers":[{"content":"Right answer! :D","isCorrect":true},{"content":"Wrong answer","isCorrect":false},{"content":"Wrong answer","isCorrect":false},{"content":"Wrong answer","isCorrect":false}],"hint":"Try 4 - 1!","explanation":"Six sticks, take away half of them."}]]};
}

/*
*Publishes list of all questions in the quiz_data variable
*/
function publish_question_list(quiz_data) {
	$(".question_list").empty();

	$.each(quiz_data, function(i, question) {
		$(".question_list").append("<div class = 'q_list_q' question_id = '"+i+"'>" + (i+1) + ") "+question.concept+"</div>");
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
	reload_mathjax();

	$(".answers").click(function() {
		var answer_id = $(this).attr("answer_id");

		//Clear any current hints
		$(".hints").empty()

		/*
		*If answer is right, give explanation
		*Else, give hint
		*/
		if(question_data.answers[answer_id].isCorrect)
			$(".hints").append("<div>"+question_data.explanation+"</div>");
		else
			$(".hints").append("<div>"+question_data.hint+"</div>");
	});
}

/*
*Function to refresh the MathJax
*/
function reload_mathjax() {
	window.MathJax = {};
	$.getScript('http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML');
}