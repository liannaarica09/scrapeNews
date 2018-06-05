//get articles in JSON format
$.getJSON("/articles", function (data) {
    for (var i = 0; i < data.length; i++) {

        var section = $("<article>");
        var noteButton = $("<button>").addClass("fas fa-sticky-note noteBtn").attr("data-id", data[i]._id);
        var titleLink = $("<a>").attr("href", data[i].link).attr("target", "_blank").append(data[i].title);
        var titleHead = $("<h3>").append(titleLink);
        var imgTag = $("<img>").attr("src", data[i].picLink);
        var blurb = $("<p>").append(data[i].blurb);

        section.append(noteButton).append(titleHead).append(imgTag).append(blurb);

        $("#articles").prepend(section);
    }
});
$(document).on("click", "#newScrape", function () {
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function (data) {
        location.reload();
        console.log(data);
    });
});

// Whenever someone clicks a note button tag
$(document).on("click", ".noteBtn", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    console.log(thisId);

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        .then(function (data) {
            console.log(data);

            $("#notes").prepend("<button data-id='" + data._id + "' id='savenote'>Save Non-Comment</button>");
            $("#notes").prepend("<input id='user' name='userName' placeholder='Your name here'>");
            $("#notes").prepend("<textarea id='bodyinput' name='body' placeholder='Add the comment you're not making here.></textarea>");
            $("#notes").prepend("<input id='titleinput' name='title' placeholder='Title'>");
            $("#notes").prepend("<h2>" + data.title + "</h2>");
            $("#notes").prepend("<button data-id='" + data._id + "' id='editNote <i class='fas fa-pen-square'>></i></button>");
            $("#notes").prepend("<button data-id='" + data._id + "' id='deleteNote' <i class='fas fa-eraser'>></i></button>");

            // If there's a note in the article
            console.log(data.note);
            if (data.note) {
                console.log("HERE:" + data.note.title);
                var noteDiv = $('<div>');
                noteDiv.append('<h2>' + data.note.title + '<h2>');
                noteDiv.append('<p>' + data.note.body + '</p>');
                $('#notes').append(noteDiv);
            }
        });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    console.log($(this).attr("data-id"));
    var thisId = $(this).attr("data-id");
    console.log($("#titleinput").value);
    console.log($("#bodyinput").value);

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            console.log(data.note);
            console.log(data.note.title);
            console.log(data.note.body);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});