// ==UserScript==
// @name        Reload on Server change
// @namespace   varunajani.com
// @description Reloads any page that has changed on the server automagically
// @include     http://localhost/*
// @version     1
// ==/UserScript==

/*
 * == Installation
 * For Firefox: Download and install Greasemonkey and then add this as a userscript.
 * For Chrome: Download this file. Open the chrome extensions tab and drag this file onto it.
 * 
 * It is recommended that you only enable this script for localhost (which is default). 
 * To enable it for other domains, simple change the @include directive above.
 * 
 * Also, it maybe beneficial to enable persistent connections (keep-alive) for your local server.
 *
 * == What this does:
 * This script removes the need to constantly switch between your text-editor/IDE and the
 * browser window to refresh and view the updates and changes.
 * 
 * This script will refresh any page in the browser, if it has changed on the server.
 * More accurately: This script will refresh any resource located at an URI,
 * provided the server is now serving a different resource at that location.
 * 
 * Which means that this will work for any HTML/XML/Image/JSON/ page.
 * Even on malformed markup, or on 404/403 error pages.
 * This also means that it doesn't matter what your server infrastructure is.
 * 
 * == Note:
 * This script achieves it's goal by conducting a fairly resource intensive standard polling
 * technique. The rationale behind the choice is given below:
 * 
 * There are many alternate approaches to this problem. Why those approaches weren't adopted?
 * 
 * A: Fetch only headers first by using a HTTP HEAD request through xmlhttprequest/GM_xmlhttpRequest. 
 * Then check if page has changed by checking ETAG or look for 304 status codes.
 * Unfortunately this is highly unreliable. Most web frameworks that generate markup, 
 * do so dynamically and even if the actual output is the same, the ETAG and status codes don't 
 * necessarily reflect that because the output is regenerated everytime. This problem can be
 * compounded if there is some variety of middleware between the server and the application,
 * that rewrites output in a way unknown to the application.
 * 
 * B: Push changes from the server (COMET, webSocket et al.): 
 * The sheer number of architecture/s that one would have to look into
 * makes this infeasible.
 * 
 * == TODO:
 * If there was some way to detect if a tab is active in a browser window, then the polling
 * can be paused when the tab is inactive and restarted when the tab is activated.
 * This is different than using window.onblur/onfocus, which considers active/inactive tab and 
 * window as the same object. Also mozHidden/webkitHidden only work when a browser is minimized.
 * A way is needed to figure if a tab is inactive in a browser irrespective of the browser being
 * active or inactive on the client machine.
 * 
 * == HOW THIS WORKS:
 * When a page is loaded, this script first fetches the same page via an XHR and saves it in memory.
 * Then at every request_interval, it continuously polls (via new XHRs) the server for the ENTIRE page. 
 * This has the advantage of being output format agnostic. Page can be malformed/403/404 and it still works.
 * Only if the new XHR response is different than the old one, it refreshes the page. This way the DOM
 * remains unchanged if the server output is unchanged. So the interactivity with a page is in no way
 * compromised. 
 * The script slows down the rate of the XHRs over a period of time to a maximum of 12 XHRs per minute.
 * Initially a request is made every 100 ms or so. That way if you are working fast and saving a lot to the 
 * file buffers, the changes will be almost instantneous. If you slow down, the refresh rate slows down.
 * Not an exact correlation to be sure.
 */
window.onload = function(){
  var page;

  // Set to 0 for instant (As long as each xmlhttpRequest takes) reload.
  // Or set to 4000 (ms) etc. so that there is a minimum gap 
  // of 4 sec between checks for change.
  var request_interval = 100;
  // Slow the request_interval progressively to a certain number of ms. 
  var slow_down_to = 5000;
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
    xhr2.open("GET", document.location.href, true);
    xhr2.onreadystatechange = function() {
      if (xhr2.readyState == 4) {
        if(xhr2.responseText != page){
          // If at any point the page changed, reload the page.
          // Using replace so that back button in browser remains functional.
          console.log('server changed');
          location.reload();
        }else{
          // Page unchanged. Recurse.
          setTimeout(function(){compare_page()}, request_interval);
          // Slow down the requests over a period of time to the lowest rate of 5 seconds.
          if(request_interval < slow_down_to){
            request_interval += request_interval * slow_down_by;
          }
          console.log('next fetch of page');
          console.log(request_interval);
        }
      }
    }
    xhr2.send();
  }
}
