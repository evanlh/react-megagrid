
window.onload = function(){
  var testGrid = [];
  for (var i = 0; i < 100000; i++){
    var row = [];
    for (var j = 0; j < 20; j++)
      row[j] = <td>{ j + i }</td>

    var clas = "item-" + i;
    testGrid.push(row);
  }

  var testColumns = [];
  for (var j = 0; j < 20; j++){
    testColumns.push("Header " + j);
  }
  var styles = {height: 500};
  var elem = <MegaGrid rowHeight="20" data={ testGrid } columns={testColumns} style={styles}>
               <MegaGridFixedHeader columns={ testColumns } />
             </MegaGrid>

  var parent = document.querySelector('.grid');
  React.render(elem, parent, function(){ console.log('rendered')});
}
