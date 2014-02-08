(function() {
    "use strict";

    /*
        data is [{participant}],
        so in english data is an array of the participants, where
            participant = {country: <country>, year: <year>, name: <name>, score: <score>}
     */
    function process(data) {
        var participants = JSON.parse(data);

        var participantsPerCountry = {};

        var participantsNumberPerCountry = _.chain(participants)
            .groupBy(function(participant) {
                return participant.country;
            })
            .tap(function(data) {
                // store result of this groupBy, because we also need it to do average score per country analytics
                participantsPerCountry = _.extend({}, data);
            })
            .map(function(participants, country) {
                return {country: country, participants: participants.length};
            })
            .sortBy(function(entry) {
                return -entry.participants; // "-" to sort descending
            })
            .value();

        var avgScorePerCountry = _.chain(participantsPerCountry)
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
        drawAvgScorePerCountry(avgScorePerCountry, participantsPerCountry);
        drawScatterCountryScoreYear(participantsPerCountry);
    }

    /*
        participantsNumberPerCountry is [{country: <country>, participants: <number of participants from this country>}],
        so in english participantsNumberPerCountry is an array of the {country:<country>, participants: <number of participants from this country>}
     */
    function drawParticipantsNumberPerCountry(participantsNumberPerCountry) {

        nv.addGraph(function() {
            var width = 500,
                height = 500;

            var chart = nv.models.pieChart()
                .x(function(d) { return d.country; })
                .y(function(d) { return d.participants; })
                .color(d3.scale.category10().range())
                .tooltipContent(function(key, y) {
                    return '<h3>' + key + '</h3>' +
                        '<p>' +  parseInt(y) + ' ' + pluralizeParticipants(y) + '</p>';
                })
                .width(width)
                .height(height);

            d3.select("#piechart svg")
                .datum(participantsNumberPerCountry)
                .transition().duration(1200)
                .attr('width', width)
                .attr('height', height)
                .call(chart);

            return chart;
        });
    }

    /*
        avgScorePerCountry is in the following format:
            avgScorePerCountry = [{avgScore:<average score>, country: <country>}],
        so in english avgScorePerCountry is an array of the the following hash {avgScore:<average score>, country: <country>}
     */
    function drawAvgScorePerCountry(avgScorePerCountry, participantsPerCountry) {
        nv.addGraph(function() {
            var chart = nv.models.discreteBarChart()
                .x(function(d) { return d.country; })
                .y(function(d) { return d.avgScore; })
                .staggerLabels(true)
                .tooltips(true)
                .tooltipContent(function(key, x, y) {
                    var participants = participantsPerCountry[x];
                    var totalParticipants = participants.length;
                    var firstNScores = 9;
                    var scoreSummary = _.chain(participants).first(firstNScores).pluck('score').value().join(', ');
                    var lastScore = _.last(participants)['score'];
                    if (totalParticipants > firstNScores) {
                        if (totalParticipants == firstNScores + 1) {
                            scoreSummary += ", " + lastScore;
                        } else {
                            scoreSummary += ", ..." + ", " + lastScore;
                        }
                    }
                    var participantsText = pluralizeParticipants(totalParticipants);
                    return '<h3>' + x + ' (' + totalParticipants + ' ' + participantsText + ')' + '</h3>' +
                        '<p>' + '[' + scoreSummary + '] / ' + totalParticipants + ' => ' + y + '</p>';
                })
                .showValues(true);

            d3.select('#averagechart svg')
                .datum([{key: "Average Score", values: avgScorePerCountry}])
                .transition().duration(500)
                .call(chart);

            return chart;
        });
    }

    /*
        participantsPerCountry is in the following format:
            participantsPerCountry = {country: [{participant}]},
         so in english participantsPerCountry is a hash/object where key is a country, and value is array of the participants,
         and 'participant' is the following data structure:
            participant = {country: <country>, name: <name>, year: <year>, score: <score>}
     */
    function drawScatterCountryScoreYear(participantsPerCountry) {
        var shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
            j = 0;
        var d = _.chain(participantsPerCountry)
            .map(function(participants, country) {
                var values = [],
                    shape = shapes[j % shapes.length];
                j++;
                _.each(participants, function(participant) {
                    values.push({
                        x: participant.score,
                        y: participant.year,
                        size: participants.length,
                        //shape: shape
                    });
                });

                return {key: country, values: values};
            })
            .sortBy(function(entry) {
                return -entry.values.length;
            })
            .value();

        nv.addGraph(function() {
            var chart = nv.models.scatterChart()
                .showDistX(true)
                .showDistY(true)
                .tooltips(true)
                .tooltipContent(function(key, score, year) {
                    var participants = participantsPerCountry[key];
                    var participant = _.find(participants, function(participant) {
                        return participant.year == year && participant.score == score;
                    });
                    var totalParticipants = participants.length,
                        participantsText = pluralizeParticipants(totalParticipants);
                    return '<strong>' +
                        key +
                        ' (' + totalParticipants + ' ' + participantsText + ') ' +
                        participant.name +
                        '</strong>';
                })
                .color(d3.scale.category10().range());

            chart.xAxis.tickFormat(d3.format('10d'));
            chart.yAxis.tickFormat(d3.format('10d'));

            d3.select('#bubblechart svg')
                .datum(d)
                .transition().duration(500)
                .call(chart);

            return chart;
        });
    }

    function pluralizeParticipants(n) {
        var participant = 'participant';
        return n > 1 ? participant + 's' : participant;
    }

    // the correct way to get the tab id using queryInfo object
    chrome.tabs.query({ currentWindow: true, active: true, status: 'complete' }, function (tabs) {
        var tab = tabs[0];
        // Sends a single message to the content script(s) in the specified tab, with an optional callback to run when a response is sent back.
        // The runtime.onMessage event is fired in each content script running in the specified tab for the current extension.
        chrome.tabs.sendMessage(tab.id, "does it matter?", process);
    });

})();