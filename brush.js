function drawBrush(x_center, y_center, radius) {
    selectionBrush = d3.svg.circularbrush()
                           .range([0,11])
                           .innerRadius(radius - 10)
                           .outerRadius(radius + 10)
                           .on('brush', dummyBrushFunction);
    svg_viz_container.append('g')
        .attr('class', 'selection_brush')
        .attr('transform', 'translate(' + x_center + ',' + y_center + ')')
        .call(selectionBrush)
}

function dummyBrushFunction() {

}
