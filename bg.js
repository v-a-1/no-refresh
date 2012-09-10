// All the content scripts loaded in various tabs that match the matched criteria of the manifest.json
// will constantly ping bg.js asking permission to make XHR requests.
// What this script does, is checks whether the content script that is asking for permission is running inside
// a tab that is currently active. Only if that is the case does this grant permission to that particular content script.

var current_tab_id = 0;

chrome.tabs.onActivated.addListener(function(activeInfo) {
  current_tab_id = activeInfo.tabId;
})

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.wish_to_make_request == true){
    if(sender.tab.id == current_tab_id){
      sendResponse({make_request: true});
    }else{
      sendResponse({make_request: false});
    }
  }
});



