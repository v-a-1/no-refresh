var current_tab_id = 0;

// This is so that switching between tabs activates polling.
chrome.tabs.onActivated.addListener(function(current) {
  // Keep track of current tab being shown all the time.
  current_tab_id = current.tabId;
  chrome.tabs.get(current.tabId, function(tab){
    console.log(tab.status);
    if(tab.status == 'complete') {
      start_polling(tab.url);
    } // End tab status
  });// End tabs.get
}); // End onActivated

// This is so that when a new url is visited in the same tab the polling can accordingly change.
chrome.tabs.onUpdated.addListener(function(tab_id, info, tab) {
  chrome.tabs.get(tab_id, function(tab){
    console.log(tab.status);
    if(tab.status == 'complete' && tab_id == current_tab_id) {
      start_polling(tab.url);
    } // End tab status
  });// End tabs.get
}); // End onActivated

var start_polling = function(url){
  var page;

  // Set to 0 for instant (As long as each xmlhttpRequest takes) reload.
  // Or set to 4000 (ms) etc. so that there is a minimum gap 
  // of 4 sec between checks for change.
  var request_interval = 100;
  // Slow the request_interval progressively to a certain number of ms. 
  var slow_down_to = 5000;
  // Slow the request_interval when tab is inactive to 30s:
  var inactive_slow_down_to = 30000;
  // Slow down percentage. 5% is expressed as 0.05;
  var slow_down_by = 0.05;

  // First make an ajax request and save the page
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      page = xhr.responseText;
      setTimeout(function(){compare_page()}, request_interval);
    }
  }
  xhr.send();

  // Make another ajax request and compare to first request response.
  var xhr2 = new XMLHttpRequest();
  var compare_page = function(){
    xhr2.open("GET", url, true);
    xhr2.onreadystatechange = function() {
      if (xhr2.readyState == 4) {
        if(xhr2.responseText != page){
          // If at any point the page changed, reload the page.
          // location.reload();
          console.log('server changed.');
        }else{
          // Slow down the requests over a period of time to the lowest rate of 5 seconds.
          if(request_interval < slow_down_to){
            request_interval += request_interval * slow_down_by;
          }else{
            request_interval = slow_down_to;
          }
          // Page unchanged. Recurse.
          setTimeout(function(){compare_page()}, request_interval);
          console.log('server remains the same.');
        }
      }
    }
    xhr2.send();
  }
}


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



