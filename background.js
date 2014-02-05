function onRequest(request, sender) {
    console.log(request);

    chrome.pageAction.show(sender.tab.id);
}


chrome.extension.onRequest.addListener(onRequest);


//chrome.runtime.onConnect.addListener(function(port) {
//    port.onMessage.addListener(function(msg, sender) {
//        console.log(msg);
//
//        chrome.pageAction.show(sender.tab.id);
//    });
//});