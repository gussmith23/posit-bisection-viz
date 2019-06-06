function createBinTooltip() {
    const tip = d3.tip()
        .attr('class', "d3-tip")
        .style("color", "black")
        .style("background-color", "lightgrey")
        .style("padding", "6px")
        .style("border-radius", "4px")
        .style("font-size", "14px")
        .offset([-10, 0])
        .html(function(d) {
            var num_posits = d.values.length
            var values_string;
            if (num_posits === 1) {
                values_string = "value in bin"
            }
            else {
                values_string = "values in bin"
            }
            return String(num_posits) + " " + values_string
        });
    svg_viz_container.call(tip);
    binMouseInteractionHelper(svg_viz_container.selectAll('.positiveHistogramBar'), tip); 
    binMouseInteractionHelper(svg_viz_container.selectAll('.negativeHistogramBar'), tip); 
}

function binMouseInteractionHelper(nodes, tip) {
    nodes.on('mouseover', function(d) {
        tip.show(d, this); 
    })
    nodes.on('mouseout', function(d) {
        tip.hide();
    })
}

function calculateBinSize(n) {
    var num_posits = (1 << n);
    var bin_size = dot_total_angle.DEGREES/(num_posits/2)
    return bin_size;
}

function calculateNumBins(n) {
    var bin_width = calculateBinSize(n);
    // we need an extra bin, because we may have a dot that falls right on the end of the range
    // of valid angles as defined by dot_total_angle.DEGREES
    var num_bins = Math.ceil(dot_total_angle.DEGREES/bin_width) + 1;
    return num_bins;
}

/**
 * @brief Calculate the bins for drawing posit distribution around the circle
 * The number/width of bins is calculated such that for ordinal, there is one posit in each bin.
 * Furthermore, bins are centered on a point, in ordinal, so the angles are a little tricky. All
 * bins are essentially shifted a bin_width/2 backwards except for the zero bin which is half
 * the size
 */
function getBinning(n, es, posits, sign) {
    var dThetas;
    if (sign === psign.POSITIVE) {
        dThetas = calculateDTheta(n, posits)
    }
    else {
        dThetas = calculateDTheta(n, posits)
    }

    var bin_width = calculateBinSize(n);
    var num_bins = calculateNumBins(n); 
    var bin_counts = [];

    for (var i = 0; i < num_bins; i++) {
        bin_counts.push({
            count: 0,
            values: []
        })
    }

    for (var i = 0; i < dThetas.length; i++) {
        var bin_index;
        // check if we could be in the 0th bin. This one is tricky, because it's half the size
        if (dThetas[i] < bin_width/2) {
            bin_index = 0;
        }
        else {
            // 1 and 2 in half index map to bin 1,
            // 3 and 4 to bin 2, so on
            var half_index = Math.floor(dThetas[i]/(bin_width/2));
            bin_index = Math.floor((half_index + 1)/2)
        }
        bin_counts[bin_index].count += 1;
        bin_counts[bin_index].values.push(posits[i])

    }
    return bin_counts; 
}

function drawHistogram(x_center, y_center, radius, n, es, posits) {
    drawPositivePosits(x_center, y_center, radius, n, es, posits.pos)
    drawNegativePosits(x_center, y_center, radius, n, es, posits.neg)
}

function drawPositivePosits(x_center, y_center, radius, n, es, posits) {
    var bin_counts = getBinning(n, es, posits, psign.POSITIVE)
    var bin_width = calculateBinSize(n)
    var max = d3.max(bin_counts, d => d.count);
    console.log(max)
    if (max < 5) {
        max = 5;
    }

    var barScale = d3.scaleLinear()
        .domain([0, max])
        .range([radius + 95, radius + 150]); 

    var arc = d3.arc()
        .startAngle(function(d,i) { 
            // if this is the start arc, it needs to be half the size and start at 0
            // (which is 180 in degrees)
            if (i === 0) {
                return Math.PI
            }
            else {
                var bin_start = 180 - ((i * bin_width) - bin_width/2)    
                // convert to radians
                return bin_start * (Math.PI/180)
            }
        })
        .endAngle(function(d,i) {
            // if this is the start arc, it needs to be half the size and start at 0
            if (i === 0) {
                if (n === 8) {
                    return (180 - bin_width/2) * (Math.PI/180) - 0.01
                }
                else {
                    return (180 - bin_width/2) * (Math.PI/180)
                }
            }
            else {
                var bin_end = 180 - (((i + 1) * bin_width) - bin_width/2)
                // if the bin_end would go past the start of the circle, bump it up
                if (bin_end < 0) {
                    return 0
                }
                else {
                    return bin_end * (Math.PI/180)
                }
            }
        })
        .innerRadius(barScale(0))
        .outerRadius(function(d) {
            if (d.count === 0) {
                return radius + 90
            }
            else {
                return barScale(+d.count)
            }
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
    var bin_width = calculateBinSize(n)
    var bin_width = calculateBinSize(n)
    var max = d3.max(bin_counts, d => d.count);
    console.log(max)
    if (max < 5) {
        max = 5;
    }
    var barScale = d3.scaleLinear()
        .domain([0, max])
        .range([radius + 95, radius + 150]); 

    var arc = d3.arc()
        .startAngle(function(d,i) { 
            // if this is the start arc, it needs to be half the size and start at 0
            // (which is 180 degrees)
            if (i === 0) {
                return Math.PI
            }
            else {
                var bin_start = 180 + ((i * bin_width) - bin_width/2)    
                // convert to radians
                return bin_start * (Math.PI/180)
            }
        })
        .endAngle(function(d,i) {
            // if this is the start arc, it needs to be half the size and start at 0
            if (i === 0) {
                if (n === 8) {
                    return (180 + bin_width/2) * (Math.PI/180) + 0.01
                }
                else {
                    return (180 + bin_width/2) * (Math.PI/180)
                }
            }
            else {
                var bin_end = 180 + (((i + 1) * bin_width) - bin_width/2)
                // if bin_end would go past the end of the circle, bump it back
                if (bin_end > 360) {
                    return 2*Math.PI
                }
                else {
                    return bin_end * (Math.PI/180)
                }
            }
        })
        .innerRadius(radius + 90)
        .outerRadius(function(d) {
            if (d.count === 0) {
                return radius + 90
            }
            else {
                return barScale(+d.count)
            }
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
