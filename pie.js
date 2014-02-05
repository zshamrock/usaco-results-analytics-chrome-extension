"use strict";

function drawParticipantsPerCountry(data) {
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
            .datum(JSON.parse(data))
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        //chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

        return chart;
    });
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var tab = tabs[0];
    console.log(tab);
    chrome.tabs.sendMessage(tab.id, "data request", drawParticipantsPerCountry);
});

//chrome.tabs.getCurrent(function(tab) {
//    console.log(tab);
//
//});