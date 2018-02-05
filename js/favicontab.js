var mode = 'link';
document.body.style.backgroundColor = localStorage['backgroundColor'];
var board = document.getElementById("board");
chrome.bookmarks.getChildren(localStorage['useFolderId'],function(roots){
  roots.forEach(function (node){
    (function outputBookmark(node) {
      if(typeof node.url !== "undefined") {
        var img = document.createElement('img');
        img.setAttribute('src',      'chrome://favicon/'+node.url);
        img.setAttribute('title',    node.title);
        img.setAttribute('data-url', node.url);
        img.setAttribute('id',       node.id);
        img.setAttribute('index',    node.index);
        img.setAttribute('class',    'favicon');
        board.appendChild(img);
      } else {
        chrome.bookmarks.getChildren(node.id, function(roots){
          roots.forEach(function (node) {
            outputBookmark(node);
          });
        });
      }
    }(node));
  });
});

var clickLink = function(ev) {
    window.open(ev.target.dataset.url, '_blank');
}
board.addEventListener("click", clickLink);

