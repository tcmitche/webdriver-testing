var _ = require('lodash');

function getRandomString(len) {
  var chars = '`1234567890-=~!@#$%^&*()_+qwertyuiop[]\\QWERTYUIOP{}|asdfghjkl;\'ASDFGHJKL:"zxcvbnm,./ZXCVBNM<>?'
  return _.sample(_.shuffle(chars.split('')), len || _.random(5, 20)).join('');
}

exports.getRandomString = getRandomString;

exports.getRandomStrings = function(n, len) {
  return _.range(2, _.random(3, n)).map(_.partial(getRandomString, len));
}

exports.fixObnoxiouslyInaccessableDestroyTodoButton = function() {
  var css = '#todo-list li .destroy { display: block; }';
  var head = document.getElementsByTagName('head')[0];
  var style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}
