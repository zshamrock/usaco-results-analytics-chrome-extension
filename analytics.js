"use strict";

function process(data) {
    var participants = JSON.parse(data);

    var participantsListPerCountry = {};

    var participantsNumberPerCountry = _.chain(participants)
        .groupBy(function(participant) {
            return participant.country;
        })
        .tap(function(data) {
            // store result of this groupBy, because we also need it to do average participants per country analytics
            participantsListPerCountry = _.extend({}, data);
        })
        .map(function(participants, country) {
            return {country: country, participants: participants.length};
        })
        .sortBy(function(entry) {
            return -entry.participants; // "-" to sort descending
        })
        .value();

    console.log(participantsListPerCountry);

    var avgScorePerCountry = _.map(participantsListPerCountry, function(participants, country) {
        var sumScore = function(memo, participant) {
            return memo + participant.score;
        };
        return {country: country, avgScore: Math.floor(_.reduce(participants, sumScore, 0) / participants.length)};
    });

    drawParticipantsNumberPerCountry(participantsNumberPerCountry);
    drawAvgScorePerCountry(avgScorePerCountry);
}

function drawParticipantsNumberPerCountry(data) {
    console.log(data);

    nv.addGraph(function() {
        var width = 500,
            height = 500;

        var chart = nv.models.pieChart()
            .x(function(d) { return d.country; })
            .y(function(d) { return d.participants; })
            .color(d3.scale.category10().range())
            .width(width)
            .height(height);

        d3.select("#chart svg")
            .datum(data)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        return chart;
    });
}

function drawAvgScorePerCountry(data) {
    console.log("drawAvgScorePerCountry");
    console.log(data);
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var tab = tabs[0];
    console.log(tab);
    chrome.tabs.sendMessage(tab.id, "does it matter?", process);
});