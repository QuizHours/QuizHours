(function(){
    $('#portal').click(function(e){
        e.preventDefault();
        $(this).parent().prepend("<form><label>Classcode: " +
          "<input type='text' id='classcode' /></label>" +
          "&nbsp;<input id='quizsubmit' type='submit' value='Go To Quiz' /></form>");
        $('#quizsubmit').click(function(event){
            event.preventDefault();
            var classcode = $('#classcode').val();
            // TODO add an ajax check for validity here
            location.href = '/course/'+classcode;
        });
        $(this).hide();
    });
})();
