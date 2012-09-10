
window.onload = function(){
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
  xhr.open("GET", document.location.href, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      console.log(xhr);
      page = xhr.responseText;
      setTimeout(function(){compare_page()}, request_interval);
      console.log('initial fetch of page');
      console.log(page);
    }
  }
  xhr.send();

  // Make another ajax request and compare to first request response.
  var xhr2 = new XMLHttpRequest();
  var compare_page = function(){
    // Ask bg.js whether this script's tab is active, and so whether to continue
    chrome.extension.sendMessage({wish_to_make_request: true}, function(response) {
      if(response.make_request == true){
        xhr2.open("GET", document.location.href, true);
        xhr2.onreadystatechange = function() {
          if (xhr2.readyState == 4) {
            if(xhr2.responseText != page){
              // If at any point the page changed, reload the page.
              // Using replace so that back button in browser remains functional.
              console.log('server changed');
              //location.reload();
            }else{
              // Page unchanged. Recurse.
              setTimeout(function(){compare_page()}, request_interval);
              // Slow down the requests over a period of time to the lowest rate of 5 seconds.
              if(request_interval < slow_down_to){
                request_interval += request_interval * slow_down_by;
              }else{
                request_interval = slow_down_to;
              }
              console.log('next fetch of page');
              console.log(request_interval);
            }
          }
        }
        xhr2.send();
      }else{
        // bg.js says no to making requests, so ask again in sometime.
        // Slow down the request upto 30 seconds. Since a tab may remain inactive for hours.
        if(request_interval < inactive_slow_down_to){
          request_interval += request_interval * slow_down_by;
        }
        console.log('request denied. Asking again. ');
        setTimeout(function(){compare_page()}, request_interval);
      }
    });

  }
}
