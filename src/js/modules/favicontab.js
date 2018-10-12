import Const       from '../const'

export default {
  showFaviconDisplay: function(id) {
    if(id === undefined) {
      id = localStorage['homeFolder'];
    }
    if(localStorage['placement'] === '0') {
      this.faviconDisplay(id);
    } 
    else {
      this.faviconDisplayManual(id);
    }
  }
  ,
  faviconDisplay: function(parentId) {
    const mainBoard    = document.createElement('main');
    const _this        = this;
    if(board.childNodes[0]) {
      board.removeChild(board.childNodes[0]);
    }
    if(parentId != localStorage['homeFolder']) {
      this.setBackFolder(parentId, mainBoard);
    }
    chrome.bookmarks.getChildren(parentId,function(roots){
      roots.forEach(function (node){
        _this.setIcon(node, mainBoard);
      });
      board.appendChild(mainBoard);
    });
  }
  , 
  faviconDisplayManual: function(parentId) {
    const _this        = this;
    const mainBoard    = document.createElement('main');
    const storageKey   = Const.positionPrefix+parentId;
    const positions    = JSON.parse(localStorage.getItem(storageKey));
    const positionData = {};
    if(board.childNodes[0]) {
      board.removeChild(board.childNodes[0]);
    }
    if(parentId != localStorage['homeFolder']) {
      this.setBackFolder(parentId, mainBoard);
    }

    chrome.bookmarks.getChildren(parentId,function(roots){
      //loop
      roots.forEach(function (node){
        if(!positions || typeof positions[node.id] === "undefined") {
          //座標なし
          _this.setIcon(node, mainBoard);
        }
        else {
          //座標あり
          positionData[node.id] = positions[node.id];
          const posi = positions[node.id].split(',');
          //出力
          const icon = _this.setIcon(node, mainBoard);
          icon.setAttribute('style','position:absolute;top:'+posi[0]+'px;left:'+posi[1]+'px;');
        }
      });
      board.appendChild(mainBoard);
      //描写毎に削除されたブックマークなどのデータを取り除くため、ローカルストレージ内のデータを更新する。
      localStorage.setItem(storageKey, JSON.stringify(positionData)); //refresh
    });
  }
  ,
  setBackFolder: function(bookmarkId, el) {
    chrome.bookmarks.get(String(bookmarkId), function(items) {
      const img = document.createElement('img');
      img.setAttribute('src',        '/img/folder_open.svg');
      img.setAttribute('class',      'icon folder');
      img.setAttribute('id',         Const.idPrefix+items[0].parentId);
      img.setAttribute('data-id',    items[0].parentId);
      img.setAttribute('draggable',  'false');
      if(localStorage['placement'] === "1") {
        if(localStorage[Const.positionPrefix+items[0].parentId]) {
          if(JSON.parse(localStorage[Const.positionPrefix+items[0].parentId])[items[0].id] !== undefined) {
              const posi = JSON.parse(localStorage[Const.positionPrefix+items[0].parentId])[items[0].id].split(',');
              img.setAttribute('style','position:absolute;top:'+posi[0]+'px;left:'+posi[1]+'px;');
          }
        }
      }
      el.insertBefore(img, el.firstChild);
    });
  }
  ,
  setIcon: function(node, el) {
    const img   = document.createElement('img');
    const key   = Const.notExistPrefix+node.parentId;
    const _this = this;
    let withoutIcons = JSON.parse(localStorage.getItem(key));
    img.addEventListener("dragstart", function(event){_this.dragstart(event)}, false);
    img.setAttribute('id',         Const.idPrefix+node.id);
    img.setAttribute('title',      node.title);
    img.setAttribute('data-id',    node.id);
    img.setAttribute('data-index', node.index);
    img.setAttribute('data-pid',   node.parentId);
    img.setAttribute('draggable', 'true');
    if(typeof node.url !== "undefined") {
      //favicon
      if (withoutIcons == null || typeof(withoutIcons[node.id]) == "undefined") {
        img.setAttribute('src',      'chrome://favicon/'+node.url);
      }
      else {
        img.setAttribute('src',      '/img/defaultIcon.png');
      }
      img.setAttribute('class',     'icon favicon');
      img.setAttribute('data-url',   node.url);
      
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width  = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);
        const defaultIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYklEQVQ4T2NkoBAwIuuPior6j8O8xmXLljVgk8MwYNmyZdgMfcjAwLAAmyFEGfDv3z9FJiamA9gMIcoAkKsiIiIUsBlClAHofkf2JkED0DWDAnrUgOEfBsRkTpzpgBjN6GoA24V1Efr1zoAAAAAASUVORK5CYII=';
        if(canvas.toDataURL() === defaultIcon) {
          let withoutIcons = JSON.parse(localStorage.getItem(key));
          if(withoutIcons == null) {
            withoutIcons = {};
          }
          withoutIcons[node.id] = 1;
          localStorage.setItem(key, JSON.stringify(withoutIcons)); //refresh
        }
      };
      el.appendChild(img);
    }
    else {
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
      } 
      else {
        el.appendChild(img);
      }
    }
    return img;
  }
  ,
  dragstart: function(event){
    if(document.getElementById('board').dataset.action !== 'move') {
      return;
    }
    const el = document.getElementById(event.target.id);
    const x = event.pageX - el.offsetLeft;
    const y = event.pageY - el.offsetTop;
    el.classList.add('draging');
    if(localStorage['placement'] == "1") {

      el.addEventListener("drag", function(event) {
        if(document.getElementById('board').dataset.action !== 'move') {
          return;
        }
        this.style.position = 'absolute';
        this.style.top      = event.pageY - y + "px";
        this.style.left     = event.pageX - x + "px";
        this.addEventListener("dragover",function(event){
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }, false);
      }, false);
      el.addEventListener("dragend", function(event) {
        if(document.getElementById('board').dataset.action !== 'move') {
          return;
        }
        const storageKey = Const.positionPrefix+event.target.dataset.pid;
        const positions  = JSON.parse(localStorage.getItem(storageKey));
        const top        = this.style.top.slice(0, -2);
        const left       = this.style.left.slice(0,-2);
        if(Number(left) < 0 || Number(top) < 0 ) {
          if(positions[event.target.dataset.id]) {
            const posi = positions[event.target.dataset.id].split(',');
            this.style.top      = posi[0]+"px";
            this.style.left     = posi[1]+"px";
          }
          else {
            this.style.position = 'none';
            this.style.top      = null;
            this.style.left     = null;
          }
        }
        else {
          positions[event.target.dataset.id] = top+','+left; 
          localStorage.setItem(storageKey, JSON.stringify(positions));
        }
        this.classList.remove("draging");
      },false);
    }
  }
  ,
  clickFavicon: function() {
    switch(document.getElementById('board').dataset.action) {
      case 'link':
        if(localStorage["linkTarget"]) {
          window.open(event.target.dataset.url, '_blank');
        } else {
          window.location.href = event.target.dataset.url;
        }
        break;
      case 'delete':
        const target  = document.getElementById(event.target.id);
        const id      = target.dataset.id;
        chrome.bookmarks.remove(id, function(){
          target.parentNode.removeChild(target);
        });
        break;
    }
  }
  ,
  clickFolder: function() {
    if(event.target.dataset.status === 'close' && document.getElementById('board').dataset.action === 'delete') {
      const target  = document.getElementById(event.target.id);
      const id      = target.dataset.id;
      if(confirm('Delete all bookmarks in this folder. Is it OK?')) {
        chrome.bookmarks.removeTree(id, function(){
          target.parentNode.removeChild(target);
        });
      }
      return;
    }
    if(localStorage['folderType'] === "1" && localStorage['placement'] === "0") {
      if(event.target.dataset.status === 'close') {
        this.openFolder(event.target.dataset.id);
      } 
      else {
        this.closeFolder(event.target.dataset.id);
      }
    } 
    else {
      this.showFaviconDisplay(event.target.dataset.id)
    }
  }
  ,
  openFolder: function(id) {
    const folderIcon = document.getElementById(Const.idPrefix+id);
    folderIcon.setAttribute('data-status', 'open');
    folderIcon.setAttribute('src',       '/img/folder_open.svg');
    const pSpan       = document.getElementById('parentFolder'+id);
    const cSpan       = document.createElement('span');
    cSpan.setAttribute('id','childFolder'+id);
    pSpan.appendChild(cSpan);

    chrome.bookmarks.getChildren(id, function(roots){
      roots.forEach(function (node){
        this.setIcon(node, cSpan);
      });
    });
  }
  ,  
  closeFolder: function(id) {
    const folderIcon = document.getElementById(Const.idPrefix+id);
    folderIcon.setAttribute('data-status', 'close');
    folderIcon.setAttribute('src',       '/img/folder.svg');
    document.getElementById('childFolder'+id).remove();
  }
  ,
  setBoradAction: function(targetId) {
    if(!targetId.length) {
      return;
    }
    const value = document.getElementById(targetId).getAttribute('value');
    document.getElementById("board").dataset.action = value;
    document.getElementById("board").removeAttribute('class');
    document.getElementById("board").classList.add(value);
  }
}

