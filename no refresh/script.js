var is_polling = false;

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

var start_polling = function(){
  is_polling = true;
}

var stop_polling = function(){
  is_polling = false;
}