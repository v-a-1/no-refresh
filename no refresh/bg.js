/* Sends start and stop messages to the content script (in each tab matching the manifest.json criteria)
 * depending on whether it is activated or not respectively. It sends a start message only if the user
 * hasn't disabled this, via the context menu. This script also manages what the Context menu text looks
 * like depending on the what is the current toggled state of the enabled variable.
 */

var current_tab_id = 0;
// Tab that is currently polling.
var polling_tab_id = false;
// Var mutated by the contextMenu clicks to provide disabling facility.
var enabled = true;

chrome.tabs.onActivated.addListener(function(activeInfo) {
  current_tab_id = activeInfo.tabId;
  stop_polling_request();
  start_polling_request();
});

var stop_polling_request = function(){
  // Tell whichever tab is currently polling to stop.
  if(polling_tab_id != false) {
    chrome.tabs.sendMessage( polling_tab_id, {stop_polling: true}, function(response) {
      if(response.ok == true) {
       polling_tab_id = false;
      }
    });   
  }
}

var start_polling_request = function(){
  // Ask current tab to start polling.
  if(enabled){
    chrome.tabs.sendMessage(current_tab_id, {start_polling: true}, function(response) {
      if(response.ok == true) {
        polling_tab_id = current_tab_id;
      }
    });
  }
}

// Callback for context menu click
var context_clicked = function(info, tab) {
	enabled = enabled ? false : true;
	title = enabled ? "Disable Auto Reload on Server Change" : "Enable Auto Reload on Server Change"; 
	chrome.contextMenus.update(info.menuItemId, { title: title});
  enabled ? start_polling_request() : stop_polling_request();
}

// Context menu for enabling/disabling reloads. This is across all pages, not just the current page.
chrome.contextMenus.create({
	"title": "Disable Auto Reload on Server Change", 
	"contexts":["page"],
	"onclick": context_clicked
}); 



