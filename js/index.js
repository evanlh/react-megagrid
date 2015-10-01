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

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var MegaGridHeader = (function (_React$Component) {
        function MegaGridHeader(props) {
            _classCallCheck(this, MegaGridHeader);

            _get(Object.getPrototypeOf(MegaGridHeader.prototype), "constructor", this).call(this, props);
        }

        _inherits(MegaGridHeader, _React$Component);

        _createClass(MegaGridHeader, [{
            key: "render",
            value: function render() {
                return React.createElement(
                    "div",
                    { className: "megagrid-header" },
                    "HEADER"
                );
            }
        }]);

        return MegaGridHeader;
    })(React.Component);

    var MegaGridRows = (function (_React$Component2) {
        function MegaGridRows() {
            _classCallCheck(this, MegaGridRows);

            if (_React$Component2 != null) {
                _React$Component2.apply(this, arguments);
            }
        }

        _inherits(MegaGridRows, _React$Component2);

        _createClass(MegaGridRows, [{
            key: "getDefaultProps",
            value: function getDefaultProps() {
                return {
                    dimensions: {
                        firstVisibleRow: 0,
                        lastVisibleRow: 0
                    },
                    data: []
                };
            }
        }, {
            key: "render",
            value: function render() {
                var rows = [],
                    min = Math.min(this.props.firstVisibleRow, this.props.data.length),
                    max = Math.min(this.props.lastVisibleRow, this.props.data.length);
                for (var i = min; i < max; i++) {
                    rows.push(this.data[i]);
                }
                var tbodyProps = { className: "megagrid-tbody" };
                return React.createElement("div", tbodyProps, rows);
            }
        }]);

        return MegaGridRows;
    })(React.Component);

    var MegaGrid = (function (_React$Component3) {
        function MegaGrid(props) {
            _classCallCheck(this, MegaGrid);

            _get(Object.getPrototypeOf(MegaGrid.prototype), "constructor", this).call(this, props);
            this.state = {
                data: this.props.data,
                columns: this.props.columns,
                topSpace: 0,
                bottomSpace: 0
            };
        }

        _inherits(MegaGrid, _React$Component3);

        _createClass(MegaGrid, [{
            key: "getDefaultProps",
            value: function getDefaultProps() {
                return {
                    rowHeight: 20,
                    data: [],
                    columns: []
                };
            }
        }, {
            key: "componentDidMount",
            value: function componentDidMount() {
                this.calculateDimensions();
                var scrollFrame = this.refs.scrollFrame.getDOMNode();
                scrollFrame.addEventListener("scroll", this.onScroll.bind(this));
            }
        }, {
            key: "onScroll",
            value: function onScroll(e) {
                console.log(e);
                this.calculateDimensions();
            }
        }, {
            key: "calculateDimensions",
            value: function calculateDimensions() {
                var scrollFrame = this.refs.scrollFrame.getDOMNode();
                var dims = {};
                dims.scrollTop = scrollFrame.scrollTop;
                if (dims.scrollTop < 0) dims.scrollTop = -dims.scrollTop;
                var scrollRect = scrollFrame.getBoundingClientRect();
                dims.scrollHeight = scrollRect.bottom - scrollRect.top;
                dims.gridHeight = this.props.rowHeight * this.state.data.length;
                // for now assume header height == row height
                dims.headerHeight = this.props.rowHeight;
                dims.gridAndHeaderHeight = dims.gridHeight + this.props.rowHeight;
                dims.firstVisibleRow = Math.floor((dims.scrollTop - dims.headerHeight) / this.props.rowHeight);
                dims.lastVisibleRow = Math.floor((dims.scrollTop - dims.headerHeight + dims.scrollHeight) / this.props.rowHeight);
                dims.visibleRowCount = dims.lastVisibleRow - dims.firstVisibleRow;
                dims.virtualGridHeight = dims.visibleRowCount * this.props.rowHeight;
                dims.topSpacer = (dims.firstVisibleRow - 1) * this.props.rowHeight; // + header?
                dims.bottomSpacer = dims.gridHeight - dims.virtualGridHeight - dims.topSpacer; // - header?
                dims.topSpacer = Math.max(dims.topSpacer, 0);
                dims.bottomSpacer = Math.max(dims.bottomSpacer, 0);
                this.setState({ dimensions: dims });
            }
        }, {
            key: "render",
            value: function render() {
                // TODO _.extend from this.props.style ?
                var scrollStyles = {
                    overflowY: "scroll"
                };
                var topSpacerStyle = {
                    height: this.state.topSpace
                };
                var bottomSpacerStyle = {
                    height: this.state.bottomSpace
                };
                return React.createElement(
                    "div",
                    { ref: "scrollFrame", className: "megagrid-scrollframe", style: scrollStyles },
                    React.createElement("div", { ref: "topSpacer", style: topSpacerStyle }),
                    "// ",
                    React.createElement(MegaGridHeader, { header: this.state.columns, dimensions: this.state.dimensions }),
                    React.createElement(MegaGridRows, { data: this.state.data, dimensions: this.state.dimensions }),
                    React.createElement("div", { ref: "bottomSpacer", style: bottomSpacerStyle })
                );
            }
        }]);

        return MegaGrid;
    })(React.Component);

    exports.MegaGrid = MegaGrid;

    window.onload = function () {

        var testGrid = [];
        for (var i = 0; i < 10000; i++) {
            var row = {};
            for (var j = 0; j < 10; j++) {
                row[j] = i + j;
            }
            testGrid.push(React.createElement(
                "div",
                { className: "item-{row[j]}" },
                row[j]
            ));
        }
        var testColumns = [];
        for (var j = 0; j < 10; j++) {
            testColumns.push("Header " + j);
        }

        var elem = React.createElement(MegaGrid, { rowHeight: "20", data: testGrid, columns: testColumns });
        var parent = document.querySelector(".grid");
        React.render(elem, parent, function () {
            console.log("rendered");
        });
    };
});