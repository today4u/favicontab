//Init Folder
const INIT_FOLDER_TITLE = 'FaviconTabFolder';

//拡張機能インストール時に実行
chrome.runtime.onInstalled.addListener(function() {
  //初期値をセット
  localStorage.setItem('backgroundColor', '#ffffff');
  localStorage.setItem('linkTarget',      0);
  localStorage.setItem('placement',       0);
  localStorage.setItem('folderType',      0);
  localStorage.setItem('useFolder',       0);
  //useFolder
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
  });
});

