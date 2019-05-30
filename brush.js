

var selectionBrush = d3.svg.circularbrush()
                           .range([0,360])
                           .extent([90, 270]);

function drawBrush(x_center, y_center, radius) {
    selectionBrush.innerRadius(radius - 10)
                  .outerRadius(radius + 10)

    svg_viz_container.select('.selection_brush').remove()
    svg_viz_container.append('g')
        .attr('class', 'selection_brush')
        .attr('transform', 'translate(' + x_center + ',' + y_center + ')')
        .style('opacity', 1E-6)
        .call(selectionBrush)
        .transition()
        .duration(750)
        .style('opacity', dot_opacity.UNFOCUSED)
    
}

/* 
 * @brief This gets called when you start brushing (when you click on the brush area)
 */
function onBrushStart() {
    console.log("Brushing starting")
}

/* 
 * @brief This gets called while you're brushing (when you drag the brush area around
 * or drag one of the handles)
 */
function whileBrushing() {
    console.log("Currently brushing")
    updateBrushedData()
}

function updateBrushedData() {
    var dtheta = calculateDTheta(n);
    var radius = calculateRadius(n);
    var x_center = width/2;
    var y_center = calculateYCenter(n);
    var posits_as_array = posits.inf.concat(posits.neg).concat(posits.pos).concat(posits.zero)
    var filtered_data = selectionBrush.filter(posits_as_array, function(d) {
        if (d.zero) { 
            return 180
        }
        else if (d.infinity) {
            return 0
        }
        else {
            var coord = getDotCoordsFromPosit(x_center, y_center, radius, dtheta, d)
            return coord.endAngle;
        }
    })
    console.log(filtered_data)
}
/* 
 * @brief This gets called when you stop brushing (when you stop clicking on the brush area)
 */
function onBrushEnd() {
    console.log("Brushing ending")
}
