document.body.style.backgroundColor = localStorage['backgroundColor'];
var board = document.getElementById("board");
chrome.bookmarks.getChildren(localStorage['useFolderId'],function(roots){
  roots.forEach(function (node){
    (function outputBookmark(node) {
      if(typeof node.url !== "undefined") {
        var a   = document.createElement('a');
        a.setAttribute('href', node.url);
        a.setAttribute('id',   node.id);
        a.setAttribute('index',node.index);
        a.setAttribute('class','favicon');
        var img = document.createElement('img');
        img.setAttribute('src','chrome://favicon/'+node.url);
        img.setAttribute('title',node.title);
        a.appendChild(img);
        board.appendChild(a);
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

