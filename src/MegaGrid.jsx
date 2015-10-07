export class MegaGridHeader extends React.Component {
  constructor(){
    super(constructor);
    this.state = {
      style: {
      },
    }
  }
  render() {
    var i = 0;
    return (
      <thead ref="thead" className="megagrid-thead" {...this.state}>
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
    var theadStyles = {};
    if (this.props.style){
      for (var p in this.props.style) theadStyles[p] = this.props.style[p];
    }
    theadStyles.transform = "translateY(" + dims.tableScrollTop + "px)";
    theadStyles['msTransform'] = theadStyles.transform;
    theadStyles['WebkitTransform'] = theadStyles.transform;
    theadStyles['MozTransform'] = theadStyles.transform;
    theadStyles['OTransform'] = theadStyles.transform;

    this.setState({style: theadStyles });
  }
}

export class MegaGridElement extends React.Component {
  render(){
    return <tr className="megagrid-element" {...this.props}>{this.props.children}</tr>
  }
}

export class MegaGridRows extends React.Component {
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
    var self = this;
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
    this.calculateDimensions(this.props);
  }

  onResize(e){
    this.calculateDimensions(this.props);
  }

  calculateDimensions(props){ // TODO clean this up
    var scrollFrame = this.refs.scrollFrame.getDOMNode();
    var dims = {};
    dims.scrollTop = scrollFrame.scrollTop;
    if (dims.scrollTop < 0) dims.scrollTop = -dims.scrollTop;
    var scrollRect = scrollFrame.getBoundingClientRect();
    dims.scrollHeight = scrollRect.bottom - scrollRect.top;
    var rowHeight = parseInt(props.rowHeight || this.props.rowHeight);
    dims.gridHeight = rowHeight * (props.data.length || this.props.data.length || 0);
    // for now assume header height == row height
    dims.headerHeight = rowHeight;

    var rowDimensions = this.calcVisibleRows(props, dims);
    for (var d in rowDimensions) dims[d] = rowDimensions[d];
    dims.gridAndHeaderHeight = dims.gridHeight + rowHeight;
    dims.virtualGridHeight = dims.visibleRowCount * rowHeight;
    var spacerDimensions = this.calcSpacerDimensions(props, dims);
    for (var d in spacerDimensions) dims[d] = spacerDimensions[d];

    dims.tableScrollTop = dims.scrollTop - dims.topSpacer;

    this.setState({ rowDimensions: rowDimensions, spacerDimensions: spacerDimensions });
    if (this.refs.header && this.refs.header.onParentRedraw){
      this.refs.header.onParentRedraw(dims);
    }
  }

  calcVisibleRows(props, dims){
    var firstVisibleRow = Math.floor((dims.scrollTop - dims.headerHeight) / props.rowHeight);
    firstVisibleRow -= parseInt(props.rowBuffer || this.props.rowBuffer);
    firstVisibleRow = Math.max(0, firstVisibleRow);
    var lastVisibleRow = Math.floor((dims.scrollTop - dims.headerHeight + dims.scrollHeight) / (props.rowHeight || this.props.rowHeight));
    lastVisibleRow += parseInt(props.rowBuffer || this.props.rowBuffer);
    lastVisibleRow = Math.max(0, Math.min(lastVisibleRow, ((props.data && props.data.length) || (this.props.data.length))));
    var visibleRowCount = lastVisibleRow - firstVisibleRow;
    return {firstVisibleRow: firstVisibleRow, lastVisibleRow: lastVisibleRow, visibleRowCount: visibleRowCount };
  }

  calcSpacerDimensions(props, dims){
    var topSpacer = (dims.firstVisibleRow - 1) * (props.rowHeight || this.props.rowHeight); // + header?
    var bottomSpacer = dims.gridHeight - dims.virtualGridHeight - topSpacer; // - header?
    topSpacer = Math.max(topSpacer, 0);
    bottomSpacer = Math.max(bottomSpacer, 0);
    return {topSpacer: topSpacer, bottomSpacer: bottomSpacer }
  }

  componentWillReceiveProps(nextProps){
    this.calculateDimensions(nextProps);
  }

  render(){
    // TODO _.extend from this.props.style ?
    var scrollStyles = {
      overflowY: 'scroll'
    }
    // TODO choose one?
    for (var p in (this.props.style || {})){
      scrollStyles[p] = this.props.style[p];
    }
    for (var p in (this.state.style || {})){
      scrollStyles[p] = this.state.style[p];
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
          { this.props.children }
          <table ref="table" className="megagrid-table" {...this.props.tableProps}>
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
  tableProps: {},
  fixedHeader: true,
  data: [],
  columns: []
}
