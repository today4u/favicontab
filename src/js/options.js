const jsonPath = '../json/options.json';

const buildUseFolder = function() {
  chrome.bookmarks.getTree(function(roots){
    const folders  = [];  
    roots.forEach(parser);
    function parser(node){
      if (node.children) {
        if(node.id != "0") {
          folders.push({"value":node.id, "index":node.index, "label":node.title, "parentId":node.parentId});
        }
        node.children.forEach(parser);
      }
    }
    buildOptionSettingRadio("useFolder",folders);
  });
  //json 
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if ((xhr.readyState === 4) && (xhr.status === 200)) {
      const data = JSON.parse(xhr.responseText);
      buildOptionSettingRadio("placement",  data.placement);
      buildOptionSettingRadio("folderType", data.folderType);
      buildOptionSettingRadio("linkTarget", data.linkTarget);
    }
  }
  xhr.open("GET",jsonPath, true);
  xhr.send(null);

  //backgroundColor
  const backgroundColor = document.getElementById('backgroundColor');
  backgroundColor.setAttribute('value',localStorage['backgroundColor']);
  backgroundColor.addEventListener("change", function (changeEvent) {
    localStorage['backgroundColor'] = changeEvent.target.value;
  });
}

function buildOptionSettingRadio (name, dataObject) { //
  const el = document.getElementById(name);
  dataObject.forEach(function(node) {
    const label   = document.createElement('label');
    const input   = document.createElement('input');
    const text    = document.createTextNode(node.label);
    input.setAttribute('value', node.value);
    input.setAttribute('type', 'radio');
    input.setAttribute('name', name);
    if(typeof node.id !== "undefined") {
      input.setAttribute('id', node.id);
    }
    if(localStorage[name] == node.value) {
      input.setAttribute('checked', 'checked');
    }
    label.appendChild(input);
    label.appendChild(text);
    el.appendChild(label);
  });
  el.addEventListener("click", function (clickEvent) {
    if (clickEvent.target.localName !== "input") {
      return;
    }
    localStorage[name] = clickEvent.target.value;
    setDisabled();
  });
}

const setDisabled = function() {
  const folderType  = document.getElementById('folderType');
  if(localStorage.getItem('placement') === "1") {
    localStorage.setItem('folderType',0);
    if(document.getElementById('folderType0')) {
      document.getElementById('folderType0').checked = true;
    }
    folderType.setAttribute('disabled','disabled');
  } else {
    folderType.removeAttribute('disabled');
  }
}

const promise = Promise.resolve();
promise
  .then(buildUseFolder())
  .then(setDisabled());

