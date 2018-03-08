const idPrefix  = 'bid'
const keyPrefix = 'positions';
document.body.style.backgroundColor = localStorage['backgroundColor'];
const board      = document.getElementById("board");

var x,y;
let setPositions = {};
if(localStorage['placement'] === "1") {
  board.classList.add('manual');
} else {
  board.classList.add('auto');
}


const faviconDisplay = function(parentId) {
  const mainBoard  = document.createElement('main');
  if(board.childNodes[0]) {
    board.removeChild(board.childNodes[0]);
  }
  chrome.bookmarks.getChildren(parentId,function(roots){

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

const faviconDisplayManual = function(parentId) {
  const mainBoard  = document.createElement('main');
  const storageKey   = keyPrefix+parentId;
  const positions    = JSON.parse(localStorage.getItem(storageKey));
  
  chrome.bookmarks.getChildren(parentId,function(roots){
    mainBoard.setAttribute('position','relative');
    if(parentId != localStorage['useFolder']) {
      chrome.bookmarks.get(String(parentId), function(items) {
        const img = document.createElement('img');
        img.setAttribute('src',       '/img/folder_open.svg');
        img.setAttribute('class',      'folder');
        img.setAttribute('id',         idPrefix+items[0].parentId);
        img.setAttribute('data-id',    items[0].parentId);
        img.setAttribute('class',      'folder');
        img.setAttribute('draggable', 'false');
        mainBoard.insertBefore(img, mainBoard.firstChild);
      });
    }
    //loop
    roots.forEach(function (node){
      if(!positions || typeof positions[node.id] === "undefined") {
        //座標なし
        icon = output(node, mainBoard);
      } else {
        //座標あり
        setPositions[node.id] = positions[node.id];
        let posi = positions[node.id].split(',');
        //出力
        const icon = output(node, mainBoard);
        icon.setAttribute('style','position:absolute;top:'+posi[0]+'px;left:'+posi[1]+'px;');
      }
    });
    board.appendChild(mainBoard);
    localStorage.setItem(storageKey, JSON.stringify(setPositions)); //refresh
  });
}


const output = function(node, el) {
  const img  = document.createElement('img');
  img.addEventListener("dragstart", dragstart, false);
  img.setAttribute('id',         idPrefix+node.id);
  img.setAttribute('title',      node.title);
  img.setAttribute('data-id',    node.id);
  img.setAttribute('data-index', node.index);
  img.setAttribute('data-pid',   node.parentId);
  img.setAttribute('draggable', 'true');
  if(typeof node.url !== "undefined") {
    //favicon
    img.setAttribute('src',      'chrome://favicon/'+node.url);
    img.setAttribute('class',     'icon favicon');
    img.setAttribute('data-url',   node.url);
    //
    el.appendChild(img);
  } else {
    //folder
    img.setAttribute('src',         '/img/folder.svg');
    img.setAttribute('class',       'icon folder');
    img.setAttribute('data-status', 'close');
    if(localStorage['placement'] === "0") {
      //span
      const span = document.createElement('span');
      span.setAttribute('id',         'parentFolder'+node.id);
      span.appendChild(img);
      el.appendChild(span);
    } else {
      el.appendChild(img);
    }
  }
  return img;
}

const click = function(event) {
  if(event.target.dataset.id === undefined) {
    return false;
  }
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
        break;
    }
  }
  else {
    if(localStorage['folderType'] === "1" && localStorage['placement'] === "0") {
      if(event.target.dataset.status === 'close') {
        openFolder(event.target.dataset.id);
      } 
      else {
        closeFolder(event.target.dataset.id);
      }
    } 
    else {
      if(localStorage['placement'] === '0') {
        faviconDisplay(event.target.dataset.id);
      } 
      else {
        faviconDisplayManual();
      }
    }
  }
}

const dragstart = function(event){
  const el = document.getElementById(event.target.id);
  el.classList.add('draging');
  x = event.pageX - this.offsetLeft;
  y = event.pageY - this.offsetTop;
  if(localStorage['placement'] === "1") {
    el.addEventListener("drag", drag, false);
  }
}

const drag = function(event) {
  var drag = document.getElementsByClassName("draging");
  drag[0].style.position = 'absolute';
  drag[0].style.top      = event.pageY - y + "px";
  drag[0].style.left     = event.pageX - x + "px";
  drag[0].addEventListener("dragend", dragend,  false);
  drag[0].addEventListener("dragover",dragover, false);
}

const dragend = function(event){
  var drag = document.getElementsByClassName("draging");
  if(localStorage['placement'] === "1") {
    var top  = drag[0].style.top.slice(0, -2);
    var left = drag[0].style.left.slice(0,-2);
    if(Number(left) < 0 || Number(top) < 0 ) {
      if(setPositions[event.target.dataset.id]) {
        var posi = setPositions[event.target.dataset.id].split(',');
        drag[0].style.top      = posi[0]+"px";
        drag[0].style.left     = posi[1]+"px";
      } else {
        drag[0].style.position = 'none';
        drag[0].style.top      = null;
        drag[0].style.left     = null;
      }
    } else {
      const storageKey = keyPrefix+event.target.dataset.pid;
      setPositions[event.target.dataset.id] = top+','+left; 
      localStorage.setItem(storageKey, JSON.stringify(setPositions));
    }
  }
  drag[0].classList.remove("draging");
}


const dragover = function(event){
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

const drop = function(event){
  if(event.target.dataset.id === undefined) {
    return;
  }
  const el = document.getElementsByClassName('draging');
  const bookmarkId  = el[0].dataset.id;
  let   changeIndex = Number(event.target.dataset.index);
  if(event.target.dataset.url) {
    //to favicon
    if(changeIndex > el[0].dataset.index) {
      changeIndex =  changeIndex+1;
    }
    chrome.bookmarks.move(bookmarkId, {"index": changeIndex});
  }
  else {
    //to folder
    chrome.bookmarks.move(bookmarkId, {"parentId": event.target.dataset.id});
  }
  faviconDisplay(event.target.dataset.pid);
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

//events
board.addEventListener("click",      click,    false);
if(localStorage['placement'] === "0") {
  board.addEventListener('dragover',   dragover, false);
  board.addEventListener('drop',       drop,     false);
}
// board.addEventListener('dragend',    dragend,  false);


//load
if(localStorage['placement'] === '0') {
  faviconDisplay(localStorage['useFolder']);  
} else {
  faviconDisplayManual(localStorage['useFolder']);
}
