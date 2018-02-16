var mode = 'link';
var idPrefix = 'bid'
document.body.style.backgroundColor = localStorage['backgroundColor'];
var board = document.getElementById("board");

var faviconDisplay = function(parentId) {
  chrome.bookmarks.getChildren(parentId,function(roots){
    if(board.childNodes[0]) {
      board.removeChild(board.childNodes[0]); 
    }
    var main = document.createElement('main');
    if(parentId != localStorage['useFolderId']) {
      chrome.bookmarks.get(String(parentId), function(items) {
        var img = document.createElement('img');
        img.setAttribute('src',       '/img/folder_open.svg');
        img.setAttribute('class',      'folder');
        img.setAttribute('id',         idPrefix+items[0].parentId);
        img.setAttribute('data-id',    items[0].parentId);
        img.setAttribute('class',      'folder');
        img.setAttribute('draggable', 'false');
        main.insertBefore(img, main.firstChild);
      });
    }
    roots.forEach(function (node){
      (function outputBookmark(node) {
        if(typeof node.url !== "undefined") {
          var img = document.createElement('img');
          img.setAttribute('src',      'chrome://favicon/'+node.url);
          img.setAttribute('title',      node.title);
          img.setAttribute('id',         idPrefix+node.id);
          img.setAttribute('data-url',   node.url);
          img.setAttribute('data-id',    node.id);
          img.setAttribute('data-index', node.index);
          img.setAttribute('data-pid',   node.parentId);
          img.setAttribute('class',     'favicon');
          img.setAttribute('draggable', 'true');
          //board.appendChild(img);
          main.appendChild(img);

        } else {
          var img = document.createElement('img');
          img.setAttribute('src',       '/img/folder.svg');
          img.setAttribute('title',      node.title);
          img.setAttribute('id',         idPrefix+node.id);
          img.setAttribute('data-id',    node.id);
          img.setAttribute('data-index', node.index);
          img.setAttribute('data-pid',   node.parentId);
          img.setAttribute('class',      'folder');
          img.setAttribute('draggable',  'true');
          //board.appendChild(img);
          main.appendChild(img);

          // chrome.bookmarks.getChildren(node.id, function(roots){
          //  roots.forEach(function (node) {
          //    outputBookmark(node);
          //  });
          // });
        }
      }(node));
    });
    board.appendChild(main);
  });
}

faviconDisplay(localStorage['useFolderId']);

var link = function(event) {
  if(event.target.dataset.url) {
    //click favicon
    window.open(event.target.dataset.url, '_blank');  
  }
  else {
    faviconDisplay(event.target.dataset.id);
  }
}

board.addEventListener("click", link, false);
board.addEventListener('dragstart',function(event){
  var el = document.getElementById(event.target.id);
  el.classList.add('draging');
},false);
board.addEventListener('dragover',function(event){
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
},false);
board.addEventListener('drop',   function(event){
  var el = document.getElementsByClassName('draging');
  var bookmarkId  = el[0].dataset.id;
  var changeIndex = Number(event.target.dataset.index);
  //
  if(event.target.dataset.url) {
    //to favicon
    if(event.target.dataset.index > el[0].dataset.index) {
      changeIndex =  changeIndex+1;
    }
    chrome.bookmarks.move(bookmarkId, {"index": changeIndex});
  }
  else {
    //to folder
    chrome.bookmarks.move(bookmarkId, {"parentId": event.target.dataset.id});
  }
  faviconDisplay(event.target.dataset.pid);
},false);
board.addEventListener('dragend',function(event){
  var el = document.getElementById(event.target.id);
  el.classList.remove("draging");
},false);

