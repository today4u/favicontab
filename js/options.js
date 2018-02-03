// save 
$('#folders').on('click', 'input[name=folder]', function() {
    localStorage['useFolderId'] = $(this).val();
});
$('#placement').on('click', 'input[name=placement]', function() {
     = $(this).val();
});


//useFolder
chrome.bookmarks.getTree(function(roots){
  roots.forEach(function(node) {
    if (!node.url) {
      if(typeof node.index !== "undefined") {
        var checked = '';
        if(localStorage['useFolderId'] == node.id) {
          checked = 'checked="checked"';
        }
        $("#folders").append('<label><input type="radio" name="folder" value="' + node.id + '" id="' + node.id + '" '+checked+'>' + node.title + '</label> ');
      }
      node.children.forEach(arguments.callee);
    }
  });
});


$.getJSON("../json/options.json" , function(data) {
    //placement
    data.placement.forEach(function(node) {
      var checked = '';
      if(localStorage['placement'] == node.value) {
        checked = 'checked="checked"';
      }
      $('#placement').append('<label><input type="radio" name="placement" value="'+node.value+'" id="'+node.id+'" type="radio" '+checked+'>'+node.label+'</label>');
    });
});

console.log(localStorage);