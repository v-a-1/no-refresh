var current_tab_id;
// Timeout object that recursively looks for changes.
// Defined here, so that it can be cleared when a new poll
// needs to be started on tab switch or tab reload.
var next_poll;

// Event Listener for tab switching.
var onActivated = function(current) {
  // Keep track of current tab being shown.
  current_tab_id = current.tabId;
  poll(''); // Clear any previous polls.
  chrome.tabs.get(current.tabId, function(tab){
    if(tab.status == 'complete') {
      poll(tab.url, current_tab_id);
    }
  });
};
// Event Listener for tab location change.
var onUpdated = function(tab_id, info, tab) {
  poll(''); // Clear any previous polls.
  chrome.tabs.get(tab_id, function(tab){
    if(tab.status == 'complete' && tab_id == current_tab_id) {
      poll(tab.url, current_tab_id);
    }
  });
};

// This is so that switching between tabs activates polling.
chrome.tabs.onActivated.addListener(onActivated);
// This is so that when user browses to a new url in the current tab,
// the polling can accordingly change.
chrome.tabs.onUpdated.addListener(onUpdated);

var url_is_allowed = function(url){

  if(!localStorage.include_url_patterns){return false;}

  var to_url_regex = function(item){
    return item
      .replace(/^\s\s*/, '') // ltrim
      .replace(/\s\s*$/, '') // rtrim
      .replace(/\//g, '\\/') // escape /
      .replace(/\*/g, '.*?') // shortcut * accepted in url patterns
      .replace(/^/, '(^') // enclose in parentheses
      .replace(/$/, '$)'); // ditto
  };

  var inc = localStorage.include_url_patterns.replace(/\r\n/g, "\n").split("\n");
  var exc = localStorage.exclude_url_patterns.replace(/\r\n/g, "\n").split("\n");
  var inc_pattern = inc.map(to_url_regex).join("|"); // One long regex
  var exc_pattern = exc.map(to_url_regex).join("|");

  return (url.match(inc_pattern) !== null &&
    url.match(exc_pattern) === null) ? true : false;

};

var poll = function(url, tab_id){
  var page;
  if (url === ''){ clearTimeout(next_poll); return; }
  // Check whether this url passes allowed patterns
  if(!url_is_allowed(url)){ return; }

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
      setTimeout(function(){compare_page();}, request_interval);
    }
  };
  xhr.send();

  // Make another ajax request and compare to first request response.
  var xhr2 = new XMLHttpRequest();
  var compare_page = function(){
    if (url === ''){ return; }
    xhr2.open("GET", url, true);
    xhr2.onreadystatechange = function() {
      if (xhr2.readyState == 4) {
        if(xhr2.responseText != page){
          // If at any point the page changed, reload the page.
          chrome.tabs.reload(tab_id);
        }else{
          // Slow down the requests over a period of time to the lowest rate of 5 seconds.
          if(request_interval < slow_down_to){
            request_interval += request_interval * slow_down_by;
          }else{
            request_interval = slow_down_to;
          }
          // Page unchanged. Recurse.
          next_poll = setTimeout(function(){compare_page();}, request_interval);
        }
      }
    };
    xhr2.send();
  };
};
//============== Context menu =======================
var enabled = true;
// Callback for context menu click
var context_clicked = function(info, tab) {
  poll(''); // Clear existing polls.
  if(enabled){
    chrome.tabs.onActivated.removeListener();
    chrome.tabs.onUpdated.removeListener();
    enabled = false;
  }else{
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.reload(tab.id);
    enabled = true;
  }
  title = enabled ? "Disable Auto Reload on Server Change" : "Enable Auto Reload on Server Change";
  chrome.contextMenus.update(info.menuItemId, { title: title});
};

// Context menu for enabling/disabling reloads. This is across all pages, not just the current page.
chrome.contextMenus.create({
	"title": "Disable Auto Reload on Server Change",
	"contexts":["page"],
	"onclick": context_clicked
});



