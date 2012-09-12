var is_polling = false;
var page = false; // Page var to be fetched on window load, to use as comparison base.
var request_interval = 300; // Set to 0 for instant (actually the time XHR takes)
var slow_down_to = 2000; // Slow down the request_interval to a certain number of ms.
var slow_down_by = 0.05; // Slow down percentage. 5% is expressed as 0.05;

// Chrome bg.js sends messages to this script asking this to start or stop polling.
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.stop_polling == true){
    if(is_polling){
      stop_polling();
    }
    sendResponse({ok: true});
  }else if(request.start_polling == true){
    if(!is_polling){
      start_polling();
    }
    sendResponse({ok: true});    
  }
});

window.onload = function(){
  // First make an ajax request and save the page
  var xhr = new XMLHttpRequest();
  xhr.open("GET", document.location.href, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      page = xhr.responseText;
      setTimeout(function(){start_polling()}, request_interval);
    }
  }
  xhr.send();
}

var start_polling = function(){
  if(page == false){
    // Window hasn't loaded yet and XHR from that hasn't finished.
    // So recurse 
    setTimeout(function(){start_polling()}, request_interval);
    return; //!! MID FUNCTION RETURN
  }
  console.log('called start_polling');
  is_polling = true;
  // Make another ajax request and compare to first request response.
  var xhr2 = new XMLHttpRequest();
  var compare_page = function(){


    // BREAKS OUT OF RECURSION. !! MID FUNCTION RETURN
    if(!is_polling){
      is_polling = false; 
      return;
    }


    xhr2.open("GET", document.location.href, true);
    xhr2.onreadystatechange = function() {
      if (xhr2.readyState == 4) {
        if(xhr2.responseText != page){
          location.reload();
        }else{
          // Slow down the requests over a period of time to the lowest rate.
          if(request_interval < slow_down_to){
            request_interval += request_interval * slow_down_by;
          }else{
            request_interval = slow_down_to;
          }
          // Page unchanged. Recurse.
          setTimeout(function(){compare_page()}, request_interval);
        }
      }
    }
    console.log('making xhr2 request');
    xhr2.send();
  }
  compare_page();
}

var stop_polling = function(){
  is_polling = false;
}