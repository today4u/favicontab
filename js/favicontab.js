const idPrefix = 'bid'
document.body.style.backgroundColor = localStorage['backgroundColor'];
const board   = document.getElementById("board");
const reserve = document.getElementById("reserve");

const faviconDisplay = function(parentId) {
  chrome.bookmarks.getChildren(parentId,function(roots){
    if(board.childNodes[0]) {
      board.removeChild(board.childNodes[0]); 
    }
    const mainBoard = document.createElement('main');
    if(parentId != localStorage['useFolder']) {
      chrome.bookmarks.get(String(parentId), function(items) {
        const img = document.createElement('img');
        img.setAttribute('src',       '/img/folder_open.svg');
        img.setAttribute('class',      'folder');
        img.setAttribute('id',         idPrefix+items[0].parentId);
        img.setAttribute('data-id',    items[0].parentId);
        img.setAttribute('class',      'folder');
        img.setAttribute('draggable',  'false');
        mainBoard.insertBefore(img, mainBoard.firstChild);
      });
    }
    roots.forEach(function (node){
      output(node, mainBoard);
    });
    board.appendChild(mainBoard);
  });
}

const facviconDisplayManual = function(parentId) {
  console.log('Manual');
  const positions    = JSON.parse(localStorage.getItem('positions'));
  let   setPositions = {};
  chrome.bookmarks.getChildren(parentId,function(roots){
    const mainBoard      = document.createElement('main');
    const mainReserve    = document.createElement('main');
    if(parentId != localStorage['useFolder']) {
      chrome.bookmarks.get(String(parentId), function(items) {
        const img = document.createElement('img');
        img.setAttribute('src',       '/img/folder_open.svg');
        img.setAttribute('class',      'folder');
        img.setAttribute('id',         idPrefix+items[0].parentId);
        img.setAttribute('data-id',    items[0].parentId);
        img.setAttribute('class',      'folder');
        img.setAttribute('draggable', 'false');
        mainReserve.insertBefore(img, mainReserve.firstChild);
      });
    }
    roots.forEach(function (node){
      if(typeof positions[node.id] === "undefined") {
        output(node, reserve);
      } else {
        setPositions[node.id] = positions[node.id]; 
        output(node, board);
      }
    });
    console.log(setPositions);
    localStorage.setItem("positions", JSON.stringify(setPositions)); //refresh
  });
}


const output = function(node, el) {
  if(typeof node.url !== "undefined") {
    const img = document.createElement('img');
    img.setAttribute('src',      'chrome://favicon/'+node.url);
    img.setAttribute('title',      node.title);
    img.setAttribute('id',         idPrefix+node.id);
    img.setAttribute('data-url',   node.url);
    img.setAttribute('data-id',    node.id);
    img.setAttribute('data-index', node.index);
    img.setAttribute('data-pid',   node.parentId);
    img.setAttribute('class',     'favicon');
    img.setAttribute('draggable', 'true');
    el.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.setAttribute('id',         'parentFolder'+node.id);
    const img  = document.createElement('img');
    img.setAttribute('src',       '/img/folder.svg');
    img.setAttribute('title',      node.title);
    img.setAttribute('id',         idPrefix+node.id);
    img.setAttribute('data-id',    node.id);
    img.setAttribute('data-index', node.index);
    img.setAttribute('data-pid',   node.parentId);
    img.setAttribute('data-status','close');
    img.setAttribute('class',      'folder');
    img.setAttribute('draggable',  'true');
    //board.appendChild(img);
    span.appendChild(img);
    el.appendChild(span);
    // Recursive
    // chrome.bookmarks.getChildren(node.id, function(roots){
    //  roots.forEach(function (node) {
    //    output(node,el);
    //  });
    // });
  }
}


const click = function(event) {
  if(event.target.dataset.url) {
    //click favicon
    switch(localStorage["linkTarget"]) {
      case "0":
        window.location.href = event.target.dataset.url;
        break;
      case "1":
        window.open(event.target.dataset.url, '_blank');
        break;
      default:
        console.log("default");
        break;
    }
  }
  else {
    if(localStorage['folderType'] == 1) {
      if(event.target.dataset.status === 'close') {
        openFolder(event.target.dataset.id);
      } else {
        closeFolder(event.target.dataset.id);
      }
    } else {
      faviconDisplay(event.target.dataset.id);
    }
  }
}

const openFolder = function(id) {
  const folderIcon = document.getElementById(idPrefix+id);
  folderIcon.setAttribute('data-status', 'open');
  folderIcon.setAttribute('src',       '/img/folder_open.svg');
  const pSpan       = document.getElementById('parentFolder'+id);
  const cSpan       = document.createElement('span');
  cSpan.setAttribute('id','childFolder'+id);
  pSpan.appendChild(cSpan);

  chrome.bookmarks.getChildren(id, function(roots){
    roots.forEach(function (node){
        output(node, cSpan);
    });
  });
}
const closeFolder = function(id) {
  const folderIcon = document.getElementById(idPrefix+id);
  folderIcon.setAttribute('data-status', 'close');
  folderIcon.setAttribute('src',       '/img/folder.svg');
  document.getElementById('childFolder'+id).remove();
}

//load
if(localStorage['placement'] === '0') {
  console.log(localStorage);
  faviconDisplay(localStorage['useFolder']);  
} else {
  facviconDisplayManual(localStorage['useFolder']);
}

//events
board.addEventListener("click", click, false);
board.addEventListener('dragstart',function(event){
  const el = document.getElementById(event.target.id);
  el.classList.add('draging');
},false);
board.addEventListener('dragover',function(event){
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
},false);
board.addEventListener('drop',   function(event){
  const el = document.getElementsByClassName('draging');
  const bookmarkId  = el[0].dataset.id;
  let   changeIndex = Number(event.target.dataset.index);
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
  const el = document.getElementById(event.target.id);
  el.classList.remove("draging");
},false);

//debug
console.log(localStorage["positions"])

