
/**
 * @brief Calculate the bins for drawing posit distribution around the circle
 */
function getBinning(n, es, posits, sign) {
    var dThetas;
    if (sign === psign.POSITIVE) {
        dThetas = calculateDTheta(n, posits)
    }
    else {
        dThetas = calculateDTheta(n, posits)
    }

    var num_bins = histogram.NUM_BINS;
    var bin_width = histogram.BIN_WIDTH_DEGREES;
    var bin_counts = [];

    for (var i = 0; i < num_bins; i++) {
        bin_counts.push({
            count: 0
        })
    }

    for (var i = 0; i < dThetas.length; i++) {
        var bin_index = Math.floor(dThetas[i]/bin_width) 
        if (bin_index == num_bins) {
            bin_index -= 1;
        }
        console.log(bin_index + " " + dThetas[i]);
        bin_counts[bin_index].count += 1;

    }
    return bin_counts; 
}

function drawHistogram(x_center, y_center, radius, n, es, posits) {
    drawPositivePosits(x_center, y_center, radius, n, es, posits.pos)
    drawNegativePosits(x_center, y_center, radius, n, es, posits.neg)
}

function drawPositivePosits(x_center, y_center, radius, n, es, posits) {
    var bin_counts = getBinning(n, es, posits, psign.POSITIVE)
    var barScale = d3.scaleLinear()
                     .domain([0, d3.max(bin_counts, d => d.count)])
                     .range([radius + 90, radius + 150]); 

    var arc = d3.arc()
                .startAngle(function(d,i) { 
                    return (Math.PI - (i * histogram.BIN_WIDTH_RADIANS)); 
                })
                .endAngle(function(d,i) { 
                    return (Math.PI - ((i + 1) * histogram.BIN_WIDTH_RADIANS));
                })
                .innerRadius(barScale(0))
                .outerRadius(function(d) {
                    return barScale(+d.count);
                })
                .padAngle(0.01);
      

    var segments = svg_viz_container.selectAll(".positiveHistogramBar").data(bin_counts)
    segments.enter().append("path")
            .attr("class", "positiveHistogramBar")
            .attr("d", arc)
            .attr('transform', "translate(" + x_center +"," + y_center + ")");
    
    segments
            .attr("d", arc)
            .attr('transform', "translate(" + x_center +"," + y_center + ")");
    segments.exit().remove();

}

function drawNegativePosits(x_center, y_center, radius, n, es, posits) {
    var bin_counts = getBinning(n, es, posits, psign.NEGATIVE)
    var barScale = d3.scaleLinear()
                     .domain([0, d3.max(bin_counts, d => d.count)])
                     .range([radius + 90, radius + 150]); 

    var arc = d3.arc()
                .startAngle(function(d,i) { 
                    return (Math.PI + (i * histogram.BIN_WIDTH_RADIANS)); 
                })
                .endAngle(function(d,i) { 
                    return (Math.PI + ((i + 1) * histogram.BIN_WIDTH_RADIANS));
                })
                .innerRadius(barScale(0))
                .outerRadius(function(d) {
                    return barScale(+d.count)
                })
                .padAngle(0.01);
      

    var segments = svg_viz_container.selectAll(".negativeHistogramBar").data(bin_counts)
    segments.enter().append("path")
            .attr("class", "negativeHistogramBar")
            .attr("d", arc)
            .attr('transform', "translate(" + x_center +"," + y_center + ")");
    segments
            .attr('transform', "translate(" + x_center +"," + y_center + ")")
            .attr("d", arc)
    segments.exit().remove();
}
