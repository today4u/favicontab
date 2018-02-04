// save event

// $('#folders').on('click', 'input[name=folder]', function() {
//     localStorage['useFolderId'] = $(this).val();
// });
// $('#placement').on('click', 'input[name=placement]', function() {
     
// });



const jsonPath = '../json/options.json';

//useFolder
chrome.bookmarks.getTree(function(roots){
  var folder   = document.getElementById('folder');
  //label.addEventListener("click", saveFolder, false);  
  roots.forEach(function(node) {
    if (!node.url) {
      if(typeof node.index !== "undefined") {
        folder.setAttribute('href', node.url);
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

//placement
var myJSON = new XMLHttpRequest();
myJSON.onreadystatechange = function() {
  if ((myJSON.readyState === 4) && (myJSON.status === 200)) {
    var placement = document.getElementById('placement');
    var data = JSON.parse(myJSON.responseText);
    data.placement.forEach(function(node) {
      var label   = document.createElement('label');
      var input   = document.createElement('input');
      var text    = document.createTextNode(node.label);
      input.setAttribute('id',    node.id);
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
      console.log(clickEvent.target.value)
    });
  }
}
myJSON.open("GET",jsonPath, true);
myJSON.send(null);


console.log(localStorage)
