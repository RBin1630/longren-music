export function debounce(fn,wait){
  var timerId = null;
  var flag = true;
  return function(){
  	var context = this
    var args = arguments
    clearTimeout(timerId);
    if(flag){
      fn.apply(context, args);
      flag = false
      }
    timerId = setTimeout(() => { flag = true},wait)
  }
}
