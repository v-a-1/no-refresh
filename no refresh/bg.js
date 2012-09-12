/* Sends start and stop messages to the content script (in each tab matching the manifest.json criteria)
 * depending on whether it is activated or not respectively. It sends a start message only if the user
 * hasn't disabled this, via the context menu. This script also manages what the Context menu text looks
 * like depending on the what is the current toggled state of the enabled variable.
 */

var current_tab_id = 0;
// Hash of tabs that are currently polling.
var polling_tabs = {}; 
// Var mutated by the contextMenu clicks to provide disabling facility.
var enabled = true;

chrome.tabs.onActivated.addListener(function(activeInfo) {

  current_tab_id = activeInfo.tabId;
  console.log('current_tab_id is '+current_tab_id);

  // Tell all tabs to stop polling
  for(tab in polling_tabs) {
    chrome.tabs.sendMessage(current_tab_id, {stop_polling: true}, function(response) {
      if(response.ok == true) {
       delete polling_tabs[''+tab+''];
       console.log('Received ok to stop_polling command, from tab with id '+ tab);
      }
    });   
  }

  // Ask activated tab to start polling provided if not disabled via context menu.
  if(enabled){
    chrome.tabs.sendMessage(current_tab_id, {start_polling: true}, function(response) {
      if(response.ok == true) {
        // Keep track of all polling tabs.
        polling_tabs[''+current_tab_id+''] = true;
        console.log('Received ok to start_polling command, from tab with id '+ current_tab_id);
      }
    });
  }

});

// Callback for context menu click
var context_clicked = function(info, tab) {
	enabled = enabled ? false : true;
	title = enabled ? "Disable Auto Reload on Server Change" : "Enable Auto Reload on Server Change"; 
	chrome.contextMenus.update(info.menuItemId, { title: title});
}

// Context menu for enabling/disabling reloads. This is across all pages, not just the current page.
chrome.contextMenus.create({
	"title": "Disable Auto Reload on Server Change", 
	"contexts":["page"],
	"onclick": context_clicked
}); 



