const idPrefix  = 'bid'
const keyPrefix = 'positions';
document.body.style.backgroundColor = localStorage['backgroundColor'];
const board      = document.getElementById("board");
const mainBoard  = document.createElement('main');
const reserve    = document.getElementById("reserve");
const divReserve = document.createElement('div');
if(localStorage['placement'] === "1") {
  board.classList.add('position');
}

const faviconDisplay = function(parentId) {
  chrome.bookmarks.getChildren(parentId,function(roots){
    if(board.childNodes[0]) {
      board.removeChild(board.childNodes[0]); 
    }
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
  const storageKey = keyPrefix+parentId;
  board.setAttribute('style','position:absolute');
  const positions    = JSON.parse(localStorage.getItem(storageKey));
  let   setPositions = {};
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
        divReserve.insertBefore(img, divReserve.firstChild);
      });
    }
    //loop
    roots.forEach(function (node){
      if(!positions || typeof positions[node.id] === "undefined") {
        //reserve
        icon = output(node, divReserve);
      } else {
        //board
        //保存用
        setPositions[node.id] = positions[node.id];
        let posi = positions[node.id].split(',');
        //出力
        const icon = output(node, mainBoard);
        icon.setAttribute('style','position:absolute;top:'+posi[0]+'px;left:'+posi[1]+'px;');
      }
    });
    reserve.appendChild(divReserve);
    board.appendChild(mainBoard);
    console.log(JSON.stringify(setPositions));
    localStorage.setItem(storageKey, JSON.stringify(setPositions)); //refresh
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
    return img;
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
    return img;
    // Recursive
    // chrome.bookmarks.getChildren(node.id, function(roots){
    //  roots.forEach(function (node) {
    //    output(node,el);
    //  });
    // });
  }
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
        console.log("default");
        break;
    }
  }
  else {
    if(localStorage['folderType'] === "1" && localStorage['placement'] === "0") {
      if(event.target.dataset.status === 'close') {
        openFolder(event.target.dataset.id);
      } else {
        closeFolder(event.target.dataset.id);
      }
    } else {
      if(localStorage['placement'] === '0') {
        faviconDisplay(event.target.dataset.id);
      } else {
        facviconDisplayManual();
      }
    }
  }
}

const dragstart = function(event){
  console.log("dragstart")
  console.log(event)
  const el = document.getElementById(event.target.id);
  el.classList.add('draging');
}
const dragover = function(event){
  // console.log("drag")
  // console.log(event)
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}
const drop = function(event){
  console.log("drop")
  //console.log(event)
  console.log('offset: '+event.offsetX+','+event.offsetY);
  console.log('page: '+event.pageX+','+event.pageY);
  console.log('layer: '+event.layerX+','+event.layerY);
  console.log('client: '+event.clientX+','+event.clientY);
  console.log('x,y: '+event.x+','+event.y);
  const el = document.getElementsByClassName('draging');
  const bookmarkId  = el[0].dataset.id;
  let   changeIndex = Number(event.target.dataset.index);
  if(localStorage['placement'] === "1") {
      return;
  }
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
}
const dragend = function(event){
  // console.log("dragend")
  // console.log(event)
  const el = document.getElementById(event.target.id);
  el.classList.remove("draging");
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
board.addEventListener('dragstart',  dragstart,false);
board.addEventListener('dragover',   dragover, false);
board.addEventListener('drop',       drop,     false);
//board.addEventListener('dragend',    dragend,  false);
reserve.addEventListener("click",    click,    false);
reserve.addEventListener('dragstart',dragstart,false);
reserve.addEventListener('dragover', dragover, false);
//reserve.addEventListener('drop',     drop,     false);
reserve.addEventListener('dragend',  dragend,  false);

//load
if(localStorage['placement'] === '0') {
  console.log(localStorage);
  faviconDisplay(localStorage['useFolder']);  
} else {
  facviconDisplayManual(localStorage['useFolder']);
}

//debug
console.log(localStorage)
