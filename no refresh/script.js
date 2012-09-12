var is_polling = false;

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.stop_polling == true){
    console.log('received stop_polling');
    if(is_polling){
      stop_polling();
    }
    sendResponse({ok: true});
  }else if(request.start_polling == true){
    console.log('received start_polling');
    if(!is_polling){
      start_polling();
    }
    sendResponse({ok: true});    
  }
});

var start_polling = function(){
  is_polling = true;
  console.log('started_polling');
}

var stop_polling = function(){
  is_polling = false;
  console.log('stopped_polling');
}