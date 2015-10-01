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

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var MegaGridHeader = (function (_React$Component) {
    _inherits(MegaGridHeader, _React$Component);

    function MegaGridHeader() {
      _classCallCheck(this, MegaGridHeader);

      _get(Object.getPrototypeOf(MegaGridHeader.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(MegaGridHeader, [{
      key: "render",
      value: function render() {
        return React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            this.props.columns.map(function (col) {
              return React.createElement(
                "td",
                null,
                col
              );
            })
          )
        );
      }
    }]);

    return MegaGridHeader;
  })(React.Component);

  var MegaGridElement = (function (_React$Component2) {
    _inherits(MegaGridElement, _React$Component2);

    function MegaGridElement() {
      _classCallCheck(this, MegaGridElement);

      _get(Object.getPrototypeOf(MegaGridElement.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(MegaGridElement, [{
      key: "render",
      value: function render() {
        return React.createElement(
          "tr",
          _extends({ className: "megagrid-element" }, this.props),
          React.createElement(
            "td",
            null,
            this.props.children
          )
        );
      }
    }]);

    return MegaGridElement;
  })(React.Component);

  var MegaGridRows = (function (_React$Component3) {
    _inherits(MegaGridRows, _React$Component3);

    function MegaGridRows() {
      _classCallCheck(this, MegaGridRows);

      _get(Object.getPrototypeOf(MegaGridRows.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(MegaGridRows, [{
      key: "render",
      value: function render() {
        var rows = [],
            min = Math.min(this.props.dimensions.firstVisibleRow, this.props.data.length),
            max = Math.min(this.props.dimensions.lastVisibleRow, this.props.data.length),
            n = 0;

        // only render the segment of rows between min & max
        for (var i = min; i < max; i++) {
          var props = {};
          for (var p in this.props.data[i].props) props[p] = this.props.data[i].props[p];
          props.key = "megagrid-tr-" + n;
          rows.push(React.createElement(this.props.element, props, this.props.data[i]));
          n++;
        }
        console.log(rows);
        var tbodyProps = { className: 'megagrid-tbody' };
        return React.createElement("tbody", tbodyProps, rows);
      }
    }]);

    return MegaGridRows;
  })(React.Component);

  MegaGridRows.defaultProps = {
    dimensions: {
      firstVisibleRow: 0,
      lastVisibleRow: 0
    },
    data: []
  };

  /*
   * MegaGrid requirements--
   * - infinite scrolling rows (vertical, horizontal is nice-to-have)
   * - fixed header
   * - dynamically adjust height to specified percentage (inherit instead?)
   * - callbacks to allow for lazy-loading rows
   */

  var MegaGrid = (function (_React$Component4) {
    _inherits(MegaGrid, _React$Component4);

    function MegaGrid(props) {
      _classCallCheck(this, MegaGrid);

      _get(Object.getPrototypeOf(MegaGrid.prototype), "constructor", this).call(this, props);
      this.state = {
        columns: this.props.columns,
        spacerDimensions: { topSpacer: 0, bottomSpacer: 0 },
        rowDimensions: {}
      };
    }

    _createClass(MegaGrid, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.calculateDimensions();
        var scrollFrame = this.refs.scrollFrame.getDOMNode();
        this.onScrollBound = this.onScroll.bind(this);
        this.onResizeBound = this.onResize.bind(this);
        scrollFrame.addEventListener('scroll', this.onScrollBound);
        scrollFrame.addEventListener('resize', this.onResizeBound);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        scrollFrame.removeEventListener('scroll', this.onScrollBound);
        scrollFrame.removeEventListener('resize', this.onResizeBound);
      }
    }, {
      key: "onScroll",
      value: function onScroll(e) {
        this.calculateDimensions();
      }
    }, {
      key: "onResize",
      value: function onResize(e) {
        this.calculateDimensions();
      }
    }, {
      key: "calculateDimensions",
      value: function calculateDimensions() {
        // TODO clean this up
        var scrollFrame = this.refs.scrollFrame.getDOMNode();
        var dims = {};
        dims.scrollTop = scrollFrame.scrollTop;
        if (dims.scrollTop < 0) dims.scrollTop = -dims.scrollTop;
        var scrollRect = scrollFrame.getBoundingClientRect();
        dims.scrollHeight = scrollRect.bottom - scrollRect.top;
        dims.gridHeight = this.props.rowHeight * this.props.data.length;
        // for now assume header height == row height
        dims.headerHeight = this.props.rowHeight;

        var rowDimensions = this.calcVisibleRows(dims);
        for (var d in rowDimensions) dims[d] = rowDimensions[d];
        dims.gridAndHeaderHeight = dims.gridHeight + this.props.rowHeight;
        dims.virtualGridHeight = dims.visibleRowCount * this.props.rowHeight;
        var spacerDimensions = this.calcSpacerDimensions(dims);
        this.setState({ rowDimensions: rowDimensions, spacerDimensions: spacerDimensions });
      }
    }, {
      key: "calcVisibleRows",
      value: function calcVisibleRows(dims) {
        var firstVisibleRow = Math.floor((dims.scrollTop - dims.headerHeight) / this.props.rowHeight);
        firstVisibleRow -= this.props.rowBuffer;
        firstVisibleRow = Math.max(0, firstVisibleRow);
        var lastVisibleRow = Math.floor((dims.scrollTop - dims.headerHeight + dims.scrollHeight) / this.props.rowHeight);
        lastVisibleRow += this.props.rowBuffer;
        lastVisibleRow = Math.max(0, Math.min(lastVisibleRow, this.props.data.length));
        var visibleRowCount = lastVisibleRow - firstVisibleRow;
        return { firstVisibleRow: firstVisibleRow, lastVisibleRow: lastVisibleRow, visibleRowCount: visibleRowCount };
      }
    }, {
      key: "calcSpacerDimensions",
      value: function calcSpacerDimensions(dims) {
        var topSpacer = (dims.firstVisibleRow - 1) * this.props.rowHeight; // + header?
        var bottomSpacer = dims.gridHeight - dims.virtualGridHeight - topSpacer; // - header?
        topSpacer = Math.max(topSpacer, 0);
        bottomSpacer = Math.max(bottomSpacer, 0);
        return { topSpacer: topSpacer, bottomSpacer: bottomSpacer };
      }
    }, {
      key: "render",
      value: function render() {
        // TODO _.extend from this.props.style ?
        var scrollStyles = {
          overflowY: 'scroll'
        };
        for (var p in this.props.style || {}) {
          scrollStyles[p] = this.props.style[p];
        }

        var topSpacerStyle = {
          height: this.state.spacerDimensions.topSpacer
        };
        var bottomSpacerStyle = {
          height: this.state.spacerDimensions.bottomSpacer
        };

        var header = this.props.headerElement ? React.createElement(this.props.headerElement, { columns: this.props.columns, dimensions: this.state.dimensions }) : "";

        return React.createElement(
          "div",
          { ref: "scrollFrame", className: "megagrid-scrollframe", style: scrollStyles },
          React.createElement("div", { ref: "topSpacer", style: topSpacerStyle }),
          React.createElement(
            "table",
            { ref: "table", className: "megagrid-table" },
            header,
            React.createElement(MegaGridRows, { data: this.props.data, dimensions: this.state.rowDimensions, element: this.props.rowElement })
          ),
          React.createElement("div", { ref: "bottomSpacer", style: bottomSpacerStyle })
        );
      }
    }]);

    return MegaGrid;
  })(React.Component);

  exports.MegaGrid = MegaGrid;

  MegaGrid.defaultProps = {
    rowHeight: 20,
    rowBuffer: 10,
    rowElement: MegaGridElement, // override this for custom element rendering
    headerElement: MegaGridHeader, // ditto for custom header
    fixedHeader: true,
    data: [],
    columns: []
  };

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
    var elem = React.createElement(MegaGrid, { rowHeight: "20", data: testGrid, columns: testColumns, style: styles });
    var parent = document.querySelector('.grid');
    React.render(elem, parent, function () {
      console.log('rendered');
    });
  };
});