class MegaGridHeader extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div className="megagrid-header">HEADER</div>
        );
    }
}

class MegaGridRows extends React.Component {
    getDefaultProps(){
        return {
            dimensions: {
                firstVisibleRow: 0,
                lastVisibleRow: 0
            },
            data: []
        }
    }
    render() {
        var rows = [],
            min = Math.min(this.props.firstVisibleRow, this.props.data.length),
            max = Math.min(this.props.lastVisibleRow, this.props.data.length);
        for (var i = min; i < max; i++){
            rows.push(this.data[i]);
        }
        var tbodyProps = { className: 'megagrid-tbody' };
        return React.createElement("div", tbodyProps, rows);
    }
}

export class MegaGrid extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: this.props.data,
            columns: this.props.columns,
            topSpace: 0,
            bottomSpace: 0
        };
    }

    getDefaultProps(){
        return {
            rowHeight: 20,
            data: [],
            columns: []
        }
    }

    componentDidMount(){
        this.calculateDimensions();
        var scrollFrame = this.refs.scrollFrame.getDOMNode();
        scrollFrame.addEventListener('scroll', this.onScroll.bind(this));
    }

    onScroll(e){
        console.log(e);
        this.calculateDimensions();
    }

    calculateDimensions(){
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

    render(){
        // TODO _.extend from this.props.style ?
        var scrollStyles = {
            overflowY: 'scroll'
        }
        var topSpacerStyle = {
            height: this.state.topSpace,
        }
        var bottomSpacerStyle = {
            height: this.state.bottomSpace
        }
        return (
            <div ref="scrollFrame" className="megagrid-scrollframe" style={ scrollStyles }>
              <div ref="topSpacer" style={ topSpacerStyle } />
              // <MegaGridHeader header={ this.state.columns } dimensions={ this.state.dimensions } />
              <MegaGridRows data={ this.state.data } dimensions={ this.state.dimensions } />
              <div ref="bottomSpacer" style={ bottomSpacerStyle } />
            </div>
        );
    }
}


window.onload = function(){

    var testGrid = [];
    for (var i = 0; i < 10000; i++){
        var row = {};
        for (var j = 0; j < 10; j++){
            row[j] = i + j;
        }
        testGrid.push(<div className="item-{row[j]}">{row[j]}</div>);
    }
    var testColumns = [];
    for (var j = 0; j < 10; j++){
        testColumns.push("Header " + j);
    }

    var elem = <MegaGrid rowHeight="20" data={ testGrid } columns={ testColumns } />
    var parent = document.querySelector('.grid');
    React.render(elem, parent, function(){
        console.log('rendered')
    });
}