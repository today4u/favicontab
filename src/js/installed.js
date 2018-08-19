import Main   from './modules/installed';
import Const  from './const'
//const INIT_FOLDER_TITLE = 'FaviconTabFolder';

//拡張機能インストール時に実行
chrome.runtime.onInstalled.addListener(function() {
  //初期値をセット
  Main.initLocalStrage('backgroundColor', '#ffffff');
  Main.initLocalStrage('linkTarget',      0);
  Main.initLocalStrage('placement',       0);
  Main.initLocalStrage('folderType',      0);
  Main.initLocalStrage('useFolder',       0);
  //順番に実行
  Promise.resolve()
      .then(function(){
          return new Promise(function(resolve, reject){
              chrome.bookmarks.getTree(function(roots){
                roots.forEach(parser);
                function parser(node){
                  if (node.children) {
                    if(node.title === Const.initFolderTitle) {
                      resolve(node.id);
                      return true;
                    }
                    node.children.forEach(parser);
                  }
                }
                reject();
              });
          });
      })
      .then(function(id){
          return new Promise(function(resolve, reject){
              //初期フォルダーに指定
              localStorage.setItem('useFolder', id);
          });
      })
      .catch(function(){
          chrome.bookmarks.create({"title": Const.initFolderTitle},function(newFolder) {
              localStorage.setItem('useFolder', newFolder.id);
          });  
      });
  //useFolder
  /*
  (function() {
    return new Promise(function(resolve, reject) {
      chrome.bookmarks.getTree(function(roots){
        var folders  = []; 
        roots.forEach(parser);
        function parser(node){
          if (node.children) {
            if(node.title === INIT_FOLDER_TITLE) {
              resolve(node.id);
              return true;
            }
            node.children.forEach(parser);
          }
        }
        reject();
      });
    });
  })().then(function(id){
    //resolve
    localStorage.setItem('useFolder', id);
  },function(){
    //reject
    //新規作成フォルダ情報が無い場合は、新規作成し,作成したfolderのidをlocalStorageに保存
    chrome.bookmarks.create({"title": INIT_FOLDER_TITLE},function(newFolder) {
      localStorage.setItem('useFolder', newFolder.id);
    });
  });*/
});

