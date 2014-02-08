(function() {
    "use strict";

    // Fired when a message is sent from either an extension process or a content script.
    // message is send from contentscript.js to enable the page action icon
    chrome.runtime.onMessage.addListener(function(message, sender) {
        chrome.pageAction.show(sender.tab.id);
    });
})();