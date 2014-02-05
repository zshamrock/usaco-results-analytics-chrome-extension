"use strict";

function grab_results(request, sender, callback) {
    // how can we verify the sender of the message (it is tab, so it has the id)
    var rows = $("tr", $("table").first()).slice(1),
        i,
        columns,
        results = [],
        result;

    for (i  = 0; i < rows.length; i++) {
        columns = $("td", rows.get(i));
        result = {country: columns.eq(0).text(),
            year: jQuery.trim(columns.eq(1).text()),
            name: columns.eq(2).text(),
            score: columns.eq(3).text()};
        results.push(result);
    }

    var participantsPerCountry = _.chain(results)
        .groupBy(function(participant) {
            return participant.country;
        })
        .map(function(participants, country) {
            return {country: country, participants: participants.length};
        })
        .sortBy(function(entry) {
            return -entry.participants; // "-" to sort descending
        })
        .value();

    callback(JSON.stringify(participantsPerCountry));
//    chrome.runtime.connect().postMessage(JSON.stringify(results));
}

chrome.extension.sendRequest({}); // enable show tab icon

chrome.runtime.onMessage.addListener(grab_results);


