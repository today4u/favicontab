//拡張機能インストール時に実行
chrome.runtime.onInstalled.addListener(function() {
//localstorageにinstall時に新規作成したフォルダ情報があるかチェック
  if(typeof localStorage.createdFolder === "undefined") {
    //新規作成フォルダ情報が無い場合は、新規作成し,作成したfolderのidをlocalStorageに保存
    chrome.bookmarks.create({"title": "FaviconTabFolder"},function(newFolder) {
      localStorage['createdFolder'] = newFolder.id;
      localStorage['useFolder']     = newFolder.id;
    });
  }
});

