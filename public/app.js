//get articles in JSON format
$.getJSON("/articles", function (data) {
    for (var i = 0; i < data.length; i++) {

        var section = $("<article>");
        var noteButton = $("<button>").addClass("fas fa-sticky-note noteBtn").attr("data-id", data[i]._id);
        var titleLink = $("<a>").attr("href", data[i].link).append(data[i].title);
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

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            // The title of the article
            $("#notes").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            $("#notes").append("<input id='titleinput' name='title' >");
            // A textarea to add a new note body
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Non-Comment</button>");

            // If there's a note in the article
            if (data.note) {
                console.log("HERE:" + data.note);
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