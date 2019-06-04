var selectedPosits = [];

var selectionBrush = d3.svg.circularbrush()

function drawBrush(x_center, y_center, radius, data) {
    selectionBrush.innerRadius(radius - 10)
                  .outerRadius(radius + 10)
                  .handleSize(.05)
                  .data(data)
                  .range([0,360])
                  .extent([90, 270]);

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
    var posits = selectionBrush.data();
    var positive_posits = posits.pos;
    var negative_posits = posits.neg;

    var posits_as_array = posits.zero
                                .concat(negative_posits)
                                .concat(positive_posits)
                                .concat(posits.inf);

    var positive_dthetas = calculateDTheta(n, positive_posits);
    var negative_dthetas = calculateDTheta(n, negative_posits);

    var dthetas_as_array = [0].concat(negative_dthetas)
                              .concat(positive_dthetas)
                              .concat([180]);

    var combined_array = posits_as_array.map(function(d, i) {
        return {
            posit: d,
            angle: dthetas_as_array[i]
        }

    })
    var radius = calculateRadius(n);
    var x_center = width/2;
    var y_center = calculateYCenter(n);

    var filtered_data = selectionBrush.filter(combined_array, function(d) {
        if (d.posit.zero) { 
            return 180
        }
        else if (d.posit.infinity) {
            return 0
        }
        else {
            var coord = getDotCoordsFromPosit(x_center, y_center, radius, d.angle, d.posit)
            return coord.endAngle;
        }
    })

    console.log(filtered_data)
    selectedPosits = filtered_data;
}
/**
 * @brief This gets called when you stop brushing (when you stop clicking on the brush area)
 */
function onBrushEnd() {
    console.log("Brushing ending")

    update(width, height, n, es);
}
