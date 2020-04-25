// for addhandler 
// to use the jquery in the app.js for showing and hiding the hidden form-->

$(document).ready(function () {
    $('.form').hide();
    $(".show").click(function () {
        $(this).siblings().toggle();
    });
})

// end of addhandler