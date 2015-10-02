(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.index = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  window.onload = function () {
    var testGrid = [];
    for (var i = 0; i < 100000; i++) {
      var row = [];
      for (var j = 0; j < 20; j++) row[j] = React.createElement(
        "td",
        null,
        j + i
      );

      var clas = "item-" + i;
      testGrid.push(row);
    }

    var testColumns = [];
    for (var j = 0; j < 20; j++) {
      testColumns.push("Header " + j);
    }
    var styles = { height: 500 };
    var elem = React.createElement(
      MegaGrid,
      { rowHeight: "20", data: testGrid, columns: testColumns, style: styles },
      React.createElement(MegaGridFixedHeader, { columns: testColumns })
    );

    var parent = document.querySelector('.grid');
    React.render(elem, parent, function () {
      console.log('rendered');
    });
  };
});