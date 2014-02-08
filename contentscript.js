(function() {
    "use strict";

    function collectData(request, sender, callback) {
        console.log("Collecting the data...");
        // TODO: use request and sender

        // how can we verify the sender of the message (it is tab, so it has the id)
        var rows = $("tr", $("table").first()).slice(1),
            i,
            columns,
            participants = [],
            participant;

        for (i  = 0; i < rows.length; i++) {
            columns = $("td", rows.get(i));
            participant = {country: columns.eq(0).text(),
                           year: parseInt(jQuery.trim(columns.eq(1).text())),
                           name: columns.eq(2).text(),
                           score: parseInt(columns.eq(3).text())};

            participants.push(participant);
        }

        callback(JSON.stringify(participants));
    }

    // activate the extension after the page content was completely loaded
    $(document).ready(function() {
        // Sends a single message to onMessage event listeners within the extension (or another extension/app).
        // send message to the background script/page (background.js)
        chrome.runtime.sendMessage({}); // enable show tab icon

        // message is sent from analytics.js when popup is open
        chrome.runtime.onMessage.addListener(collectData);
    });

})();

