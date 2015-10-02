export class MegaGridHeader extends React.Component {
  constructor(){
    super(constructor);
    this.state = {
      theadStyles: {
      },
    }
  }
  render() {
    var i = 0;
    return (
      <thead ref="thead" className="megagrid-thead" style={this.state.theadStyles} >
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

export class MegaGridFixedHeader extends MegaGridHeader {
  onParentRedraw(dims){
    var theadStyles = {
      transform: "translateY(" + dims.tableScrollTop + "px)"
    }
    theadStyles['msTransform'] = theadStyles.transform;
    theadStyles['WebkitTransform'] = theadStyles.transform;
    theadStyles['MozTransform'] = theadStyles.transform;
    theadStyles['OTransform'] = theadStyles.transform;

    this.setState({theadStyles: theadStyles });
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
    var tbodyProps = { className: 'megagrid-tbody', key: 'megagrid-tbody' };
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
    var rowHeight = parseInt(this.props.rowHeight);
    dims.gridHeight = rowHeight * this.props.data.length;
    // for now assume header height == row height
    dims.headerHeight = rowHeight;

    var rowDimensions = this.calcVisibleRows(dims);
    for (var d in rowDimensions) dims[d] = rowDimensions[d];
    dims.gridAndHeaderHeight = dims.gridHeight + rowHeight;
    dims.virtualGridHeight = dims.visibleRowCount * rowHeight;
    var spacerDimensions = this.calcSpacerDimensions(dims);
    for (var d in spacerDimensions) dims[d] = spacerDimensions[d];

    dims.tableScrollTop = dims.scrollTop - dims.topSpacer;

    this.setState({ rowDimensions: rowDimensions, spacerDimensions: spacerDimensions });
    if (this.refs.header && this.refs.header.onParentRedraw){
      this.refs.header.onParentRedraw(dims);
    }
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
    var headerProps = { ref: 'header' };
    for (var p in this.props) headerProps[p] = this.props[p];

    return (
      <div ref="scrollFrame" className="megagrid-scrollframe" style={ scrollStyles }>
        <div ref="topSpacer" style={ topSpacerStyle } />
          <table ref="table" className="megagrid-table">
            { React.createElement(this.props.headerElement, headerProps) }
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
  headerElement: MegaGridFixedHeader, // ditto for custom header
  fixedHeader: true,
  data: [],
  columns: []
}
