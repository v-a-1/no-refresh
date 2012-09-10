// All the content scripts loaded in various tabs that match the matched criteria of the manifest.json
// will constantly ping bg.js asking permission to make XHR requests.
// What this script does, is checks whether the content script that is asking for permission is running inside
// a tab that is currently active. Only if that is the case does this grant permission to that particular content script.

var current_tab_id = 0;

chrome.tabs.onActivated.addListener(function(activeInfo) {
  current_tab_id = activeInfo.tabId;
})

// Var mutated by the contextMenu clicks to provide disabling facility.
var enabled = true;
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.wish_to_make_request == true){
    if(sender.tab.id == current_tab_id && enabled == true){
      sendResponse({make_request: true});
    }else{
      sendResponse({make_request: false});
    }
  }
});

// Callback for context menu click
var context_clicked = function(info, tab){
	enabled = enabled ? false : true;
	title = enabled ? "Disable Auto Reload on Server Change" : "Enable Auto Reload on Server Change"; 
	chrome.contextMenus.update(info.menuItemId, { title: title});
}

// == Context menu for enabling/disabling reloads. This is across all pages, not just the current page.
chrome.contextMenus.create({
	"title": "Disable Auto Reload on Server Change", 
	"contexts":["page"],
	"onclick": context_clicked
}); 



