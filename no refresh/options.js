// Refer https://developer.chrome.com/extensions/contentSecurityPolicy.html
// and http://developer.chrome.com/extensions/options.html
document.addEventListener('DOMContentLoaded', function () {
  restore_options();
  document.querySelector('button').addEventListener('click', save_options);
});
var save_options = function(){
	localStorage.include_url_patterns = document.getElementById('include_url_patterns').value;
	localStorage.exclude_url_patterns = document.getElementById('exclude_url_patterns').value;
	localStorage.ignore_in_page_regex = document.getElementById('ignore_in_page_regex').value;
};
var restore_options = function(){
	if(localStorage.include_url_patterns){
		document.getElementById('include_url_patterns').value = localStorage.include_url_patterns;
	}
	if(localStorage.exclude_url_patterns){
		document.getElementById('exclude_url_patterns').value = localStorage.exclude_url_patterns;
	}
	if(localStorage.ignore_in_page_regex){
		document.getElementById('ignore_in_page_regex').value = localStorage.ignore_in_page_regex;
	}
};