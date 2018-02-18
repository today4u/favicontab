const jsonPath = '../json/options.json';

//useFolder
chrome.bookmarks.getTree(function(roots){
  var folder   = document.getElementById('folder');  
  roots.forEach(function(node) {
    if (!node.url) {
      if(typeof node.index !== "undefined") {
        var label   = document.createElement('label');
        var input   = document.createElement('input');
        var text    = document.createTextNode(node.title);
        input.setAttribute('id',    node.id);
        input.setAttribute('value', node.id);
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'folder');
        if(localStorage['useFolderId'] == node.id) {
            input.setAttribute('checked', 'checked');
        }
        label.appendChild(input);
        label.appendChild(text);
        folder.appendChild(label);
      }
      node.children.forEach(arguments.callee);
    }
  });
  folder.addEventListener("click", function (clickEvent) {
    if (clickEvent.target.localName !== "input") {
       return;
    }
    localStorage['useFolderId'] = clickEvent.target.value;
  });
});


var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if ((xhr.readyState === 4) && (xhr.status === 200)) {
    var data = JSON.parse(xhr.responseText);
    //placement
    var placement = document.getElementById('placement');
    data.placement.forEach(function(node) {
      var label   = document.createElement('label');
      var input   = document.createElement('input');
      var text    = document.createTextNode(node.label);
      input.setAttribute('value', node.value);
      input.setAttribute('type', 'radio');
      input.setAttribute('name', 'placement');
      if(localStorage['placement'] == node.value) {
          input.setAttribute('checked', 'checked');
      }
      label.appendChild(input);
      label.appendChild(text);
      placement.appendChild(label);
    });
    placement.addEventListener("click", function (clickEvent) {
      if (clickEvent.target.localName !== "input") {
        return;
      }
      localStorage['placement'] = clickEvent.target.value;
    });

    //folderType
    var folderType = document.getElementById('folderType');
    data.folderType.forEach(function(node) {
      var label = document.createElement('label');
      var input = document.createElement('input');
      var text  = document.createTextNode(node.label);
      input.setAttribute('value', node.value);
      input.setAttribute('type', 'radio');
      input.setAttribute('name', 'folderType');
      if(localStorage['folderType'] == node.value) {
          input.setAttribute('checked', 'checked');
      }
      label.appendChild(input);
      label.appendChild(text);
      folderType.appendChild(label);
    });
    folderType.addEventListener("click", function (clickEvent) {
      if (clickEvent.target.localName !== "input") {
        return;
      }
      localStorage['folderType'] = clickEvent.target.value;
      console.log(clickEvent.target.value)
    });
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

