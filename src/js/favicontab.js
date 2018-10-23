import Main  from './modules/favicontab';

const board  = document.getElementById("board");
const header = document.getElementById("header");
document.body.style.backgroundColor = localStorage['backgroundColor'];

if(localStorage['placement'] === "1") {
    document.body.classList.add('manual');
} else {
    document.body.classList.add('auto');
}

const actionController = document.getElementById("actionController");
actionController.addEventListener("click",function(event) {
  Main.setBoradAction(event.target.id);
});

//hide header
document.getElementById("headerHide").addEventListener("click",function(event) {
  header.style.display = "none";
});
//create folder
document.getElementById("createFolder").addEventListener("click",function(event) {
  document.getElementById("modal").style.display = '';
  document.getElementById("folderNameText").value = "";
  document.getElementById("folderNameText").focus();
  //Main.modalCreateFolder();
});
//modal cancel
document.getElementById("modal").addEventListener('click',function(event) {
  document.getElementById("modal").style.display = "none";
});
document.getElementById("modalCancel").addEventListener('click',function(event) {
  document.getElementById("modal").style.display = "none";
});
document.getElementById("modalContent").addEventListener('click',function(event) {
  event.stopPropagation();
});
document.getElementById("modalExecution").addEventListener('click',function(event) {
  Main.crateFolder(document.getElementById("folderNameText").value);
});

// document.getElementById("modalCancel").addEventListener('click',function(event){
//   document.getElementById("modal").style.display = "none";
// });

function out(s) {
  return function(e) {
    e.stopPropagation();
    console.log(s);
  }
}


//events
board.addEventListener("click",function(event) {
    if(event.target.dataset.id === undefined) {
        return false;
    }
    if(event.target.dataset.url) {
        Main.clickFavicon();
    }
    else {
        Main.clickFolder();
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
        Main.showFaviconDisplay(event.target.dataset.pid);
    }, false);
}

Main.showFaviconDisplay(localStorage['homeFolder']);

