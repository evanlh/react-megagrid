class MegaGridHeader extends React.Component {
  render() {
    var i = 0;
    return (
      <thead ref="thead">
        <tr ref="tr">
          {
            this.props.columns.map(function(col){
                i++;
                var key = "column-" + i;
                return <th className="megagrid-th" key={key}>{col}</th>
            })
          }
        </tr>
      </thead>
    );
  }
}

class MegaGridFixedHeader extends MegaGridHeader {
  onParentRedraw(e){
    console.log('hit child onparentredraw');
  }
}

class MegaGridElement extends React.Component {
  render(){
    return <tr className="megagrid-element" {...this.props}>{this.props.children}</tr>
  }
}

class MegaGridRows extends React.Component {
  render() {
    var rows = [],
        min = Math.min(this.props.dimensions.firstVisibleRow, this.props.data.length),
        max = Math.min(this.props.dimensions.lastVisibleRow, this.props.data.length),
        n = 0;

    // only render the segment of rows between min & max
    for (var i = min; i < max; i++){
      var props = {};
      for (var p in this.props.data[i].props) props[p] = this.props.data[i].props[p];
      props.key = "megagrid-tr-" + n;
      rows.push(React.createElement(this.props.element, props, this.props.data[i]));
      n++;
    }
    var tbodyProps = { className: 'megagrid-tbody' };
    return React.createElement("tbody", tbodyProps, rows);
  }
}

MegaGridRows.defaultProps = {
  dimensions: {
    firstVisibleRow: 0,
    lastVisibleRow: 0
  },
  data: []
}


/*
 * MegaGrid requirements--
 * - infinite scrolling (vertical required, horizontal is nice-to-have)
 * - fixed header
 * - dynamically adjust height to specified percentage (inherit & add this instead?)
 * - callbacks to allow for lazy-loading rows
 */
export class MegaGrid extends React.Component {
  constructor(props){
    super(props);
    this.childHandlers = {};
    this.state = {
      columns: this.props.columns,
      spacerDimensions: { topSpacer: 0, bottomSpacer: 0 },
      rowDimensions: { }
    };
  }

  componentDidMount(){
    this.calculateDimensions();
    var scrollFrame = this.refs.scrollFrame.getDOMNode();
    this.onScrollBound = this.onScroll.bind(this);
    this.onResizeBound = this.onResize.bind(this);
    scrollFrame.addEventListener('scroll', this.onScrollBound);
    scrollFrame.addEventListener('resize', this.onResizeBound);
    this.bindChildHandler('onParentRedraw');
  }

  componentWillUnmount(){
    scrollFrame.removeEventListener('scroll', this.onScrollBound);
    scrollFrame.removeEventListener('resize', this.onResizeBound);
  }

  onScroll(e){
    this.calculateDimensions();
  }

  onResize(e){
    this.calculateDimensions();
  }

  calculateDimensions(){ // TODO clean this up
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
    this.applyChildHandler('onParentRedraw', [dims]);
  }

  calcVisibleRows(dims){
    var firstVisibleRow = Math.floor((dims.scrollTop - dims.headerHeight) / this.props.rowHeight);
    firstVisibleRow -= this.props.rowBuffer;
    firstVisibleRow = Math.max(0, firstVisibleRow);
    var lastVisibleRow = Math.floor((dims.scrollTop - dims.headerHeight + dims.scrollHeight) / this.props.rowHeight);
    lastVisibleRow += this.props.rowBuffer;
    lastVisibleRow = Math.max(0, Math.min(lastVisibleRow, this.props.data.length));
    var visibleRowCount = lastVisibleRow - firstVisibleRow;
    return {firstVisibleRow: firstVisibleRow, lastVisibleRow: lastVisibleRow, visibleRowCount: visibleRowCount };
  }

  calcSpacerDimensions(dims){
    var topSpacer = (dims.firstVisibleRow - 1) * this.props.rowHeight; // + header?
    var bottomSpacer = dims.gridHeight - dims.virtualGridHeight - topSpacer; // - header?
    topSpacer = Math.max(topSpacer, 0);
    bottomSpacer = Math.max(bottomSpacer, 0);
    return {topSpacer: topSpacer, bottomSpacer: bottomSpacer }
  }

  bindChildHandler(method, args){
      var self = this;
      if (!self.childHandlers[method]) self.childHandlers[method] = [];
      React.Children.forEach(this.props.children, function(c){
          if (c[method] && typeof c[method] == 'function'){
              self.childHandlers[method].push(c[method].bind(c));
          }
      });
  }

  unbindChildHandlers(){
      this.childHandlers = {};
  }

  applyChildHandler(method, args){
      var handlers = this.childHandlers[method] || [];
      handlers.forEach(function(m){
          m.apply(m, args);
      });
  }

  render(){
    // TODO _.extend from this.props.style ?
    var scrollStyles = {
      overflowY: 'scroll'
    }
    for (var p in (this.props.style || {})){
      scrollStyles[p] = this.props.style[p];
    }

    var topSpacerStyle = {
      height: this.state.spacerDimensions.topSpacer,
    }
    var bottomSpacerStyle = {
      height: this.state.spacerDimensions.bottomSpacer
    }

    return (
      <div ref="scrollFrame" className="megagrid-scrollframe" style={ scrollStyles }>
        <div ref="topSpacer" style={ topSpacerStyle } />
          <table ref="table" className="megagrid-table">
            <MegaGridRows data={ this.props.data } dimensions={ this.state.rowDimensions } element={ this.props.rowElement } />
          </table>
        <div ref="bottomSpacer" style={ bottomSpacerStyle } />
      </div>
    );
  }
}

MegaGrid.defaultProps = {
  rowHeight: 20,
  rowBuffer: 10,
  rowElement: MegaGridElement, // override this for custom element rendering
  headerElement: MegaGridHeader, // ditto for custom header
  fixedHeader: true,
  data: [],
  columns: []
}


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
