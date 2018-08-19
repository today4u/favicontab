import Main  from './modules/favicontab';

const board = document.getElementById("board");
document.body.style.backgroundColor = localStorage['backgroundColor'];

if(localStorage['placement'] === "1") {
    board.classList.add('manual');
} else {
    board.classList.add('auto');
}

//events
board.addEventListener("click",function(event) {
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
                Main.openFolder(event.target.dataset.id);
            } 
            else {
                Main.closeFolder(event.target.dataset.id);
            }
        } 
        else {
            if(localStorage['placement'] === '0') {
                Main.faviconDisplay(event.target.dataset.id);
            } 
            else {
                Main.faviconDisplayManual(event.target.dataset.id);
            }
        }
    }
},false);

if(localStorage['placement'] === "0") {
    board.addEventListener('dragover',   function(event){
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, false);
    board.addEventListener('drop',function(event){
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
        Main.faviconDisplay(event.target.dataset.pid);
    }, false);
    //load
    Main.faviconDisplay(localStorage['useFolder']);
}
else {
    //load
    Main.faviconDisplayManual(localStorage['useFolder']);
}

