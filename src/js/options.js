const jsonPath = '../json/options.json';

//useFolder
chrome.bookmarks.getTree(function(roots){
  var folders  = [];  
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

// options.json
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if ((xhr.readyState === 4) && (xhr.status === 200)) {
    var data = JSON.parse(xhr.responseText);
    buildOptionSettingRadio("placement",  data.placement);
    buildOptionSettingRadio("folderType", data.folderType);
    buildOptionSettingRadio("linkTarget", data.linkTarget);
  }
}
xhr.open("GET",jsonPath, true);
xhr.send(null);

//backgroundColor
var backgroundColor = document.getElementById('backgroundColor');
backgroundColor.setAttribute('value',localStorage['backgroundColor']);
backgroundColor.addEventListener("change", function (changeEvent) {
  localStorage['backgroundColor'] = changeEvent.target.value;
});




function buildOptionSettingRadio (name, dataObject) { //
  var el = document.getElementById(name);
  dataObject.forEach(function(node) {
    var label   = document.createElement('label');
    var input   = document.createElement('input');
    var text    = document.createTextNode(node.label);
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
    valueControl(name, clickEvent.target.value);
  });
}
const valueControl = function(name, value) {
   switch(name) {
      case 'placement':
        const folderType = document.getElementById('folderType');
        if(value === "1") {
          localStorage.setItem('folderType',0);
          document.getElementById('folderType0').checked = true;
          folderType.setAttribute('disabled','disabled');
        } else {
          folderType.removeAttribute('disabled');
        }
        console.log(folderType.child);
        break;
      default:
        break;
   }
}
