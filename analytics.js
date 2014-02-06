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

    var avgScorePerCountry = _.chain(participantsListPerCountry)
        .map(function(participants, country) {
            var sumScore = function(memo, participant) {
                return memo + participant.score;
            };
            return {country: country, avgScore: Math.floor(_.reduce(participants, sumScore, 0) / participants.length)};
        })
        .sortBy(function(entry) {
            return entry.country;
        })
        .value();

    drawParticipantsNumberPerCountry(participantsNumberPerCountry);
    drawAvgScorePerCountry(avgScorePerCountry);
}

function drawParticipantsNumberPerCountry(data) {

    nv.addGraph(function() {
        var width = 500,
            height = 500;

        var chart = nv.models.pieChart()
            .x(function(d) { return d.country; })
            .y(function(d) { return d.participants; })
            .color(d3.scale.category10().range())
            .width(width)
            .height(height);

        d3.select("#piechart svg")
            .datum(data)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        return chart;
    });
}

function drawAvgScorePerCountry(data) {

    nv.addGraph(function() {
        var chart = nv.models.discreteBarChart()
            .x(function(d) { return d.country; })
            .y(function(d) { return d.avgScore; })
            .staggerLabels(true)
            .tooltips(true)
            .showValues(true);

        d3.select('#averagechart svg')
            .datum([{key: "Average Score", values: data}])
            .transition().duration(500)
            .call(chart);

        return chart;
    });
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, "does it matter?", process);
});