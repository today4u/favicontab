import Const from '../const'

export default {
  buildOptionItems: function() {
    const self = this;
    //use folder
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
      self.buildOptionSettingRadio("useFolder",folders);
    });
    //other options
    self.buildOptionSettingRadio("placement",  Const.optionsData.placement);
    self.buildOptionSettingRadio("folderType", Const.optionsData.folderType);
    self.buildOptionSettingRadio("linkTarget", Const.optionsData.linkTarget);
    //backgroundColor
    const backgroundColor = document.getElementById('backgroundColor');
    backgroundColor.setAttribute('value',localStorage['backgroundColor']);
    backgroundColor.addEventListener("change", function (changeEvent) {
      localStorage['backgroundColor'] = changeEvent.target.value;
    });
  },

  buildOptionSettingRadio: function(name, dataObject) {
    const el = document.getElementById(name);
    const self = this;
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
      self.disabledControl();
    });
  },
    
  disabledControl: function() {
    const folderType  = document.getElementById('folderType');
    if(localStorage.getItem('placement') === "1") {
      localStorage.setItem('folderType',0);
      if(document.getElementById('folderType0')) {
        document.getElementById('folderType0').checked = true;
      }
      folderType.setAttribute('disabled','disabled');
    }
    else {
      folderType.removeAttribute('disabled');
    }
  }
}


