var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/scrapeNews");


//routes

//scrape site
app.get("/scrape", function (req, res) {
    axios.get("https://www.themarysue.com/").then(function (response, err) {
        var $ = cheerio.load(response.data);
        // console.log($(".post-primary").find("a"));
        $(".post-chron").each(function (i, element) {
            var result = {};

            result.title = $(this)
                .find("h3 > a")
                .text();
            result.link = $(this)
                .find("h3 > a")
                .attr("href");
            result.picLink = $(this)
                .find(".featured-img")
                .attr("style").replace(/[^()]*\(([^()]*)\)[;]/g, "$1");
            result.blurb = $(this)
                .find(".blurb > p")
                .text();

            console.log(result);

            db.Article.find({
                title: result.title
            }).then(function (answer) {
                if (answer.length != 0) {
                    db.Article.create(result)
                        .then(function (dbArticle) {
                            console.log("HERE:" + dbArticle);
                        })
                        .catch(function (err) {
                            return res.json(err);
                        });
                }
            });
        });


        res.send("Scrape Complete");
    });
});

//get all articles
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//get article by id and populate it with its note/notes
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({
            _id: req.params.id
        })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//save update note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            console.log(req.body);
            console.log("HERE: " + req.params.id);
            console.log(dbNote._id);
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            console.log(dbArticle.note);
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});