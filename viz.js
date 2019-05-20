// @note svg_viz_container is a global variable defined in index.html
COLORS = ["#FF2100", "#C98700", "#2867FF", "magenta"]


/**
 * Update data with new posit parameters.
 *
 * Regenerates set of posits, splits them into positive, negative, zero, and
 * infinity; binds new set of data to the viz.
 */
function update(width, height, n, es, format) {
    const posits = generatePositsOfLength(n, es);

    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    const zero = posits.filter(p => p.value === 0.0);
    const infinity = posits.filter(p => p.value === Infinity);
    console.assert(zero && infinity);
    console.assert(positivePosits.length === negativePosits.length);
    console.assert(positivePosits.length + negativePosits.length + 2 === 2**n);
    drawProjectiveRealsLine(width, height, n, es, format);
    createLegend();
    var tip = createTooltip(n, es);
    setMouseInteraction(tip)
}

/**
 * @brief Creates a legend for colors used in the bitstrings
 */
function createLegend() {
    const color = d3.scaleOrdinal()
        .range([COLORS[0], COLORS[1], COLORS[2], COLORS[3]])
        .domain(["Sign","Regime","Exponent","Fraction"]);

    const legend = svg_viz_container
        .selectAll(".legend")
        .data(color.domain())
        .enter()
        .append('g')
        .attr("class", "legend")
        .attr("transform", function(d,i) {
            return `translate(0, ${i * 20})`;
        });

    // The legend is <box> <text>, this creates the colored box portion
    legend.append('rect')
        .attr('class', 'legend-rect')
        .attr('x', width + margin.right-12)
        .attr('y', 65)
        .attr('width', 12)
        .attr('height', 12)
        .style('fill', color)

    // This creates the text portion
    legend.append("text")
        .attr('class', 'legend-text')
        .attr("x", width + margin.right-22)
        .attr("y", 70)
        .style('font-size', "12px")
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;});
}

/**
 * @brief Create a tooltip that appears when hovering over points in the visualization
 *   The tooltip shows the calculation from the posit bitstring that given the corrseponding
 *   fractional value
 * @param n Current N value of the visualization
 * @param es Current ES value of the visualization
 * @return D3 tooltip object
 */
function createTooltip(n, es) {
    const tip = d3.tip()
        .attr('class', "d3-tip")
        .style("color", "black")
        .style("background-color", "lightgrey")
        .style("padding", "6px")
        .style("border-radius", "4px")
        .style("font-size", "14px")
        .offset([-10, 0])
        .html(function(d) {
            var decode = decodePosit(d.bitstring, n, es)
            if (decode.infinity) {
                return "Infinity";
            } else if (decode.zero) {
                return "Zero";
            } else {
                var value = String(decode.value) + " = ";
                var sign = `<span style="color:${(COLORS[0])}">${(decode.calc.sign)}</span>`
                var useed = `<span style="color:${(COLORS[1])}">${(decode.calc.useed)}</span>`
                var k = `<span style="color:${(COLORS[1])}">${(decode.calc.k)}</span>`
                var exp = `<span style="color:${(COLORS[2])}">${(decode.calc.exp)}</span>`
                var frac = `<span style="color:${(COLORS[3])}">${(decode.calc.frac)}</span>`
                return value + sign + " * " + useed + "^" + k + " * " +
                    String(2) + "^" + exp + " * " + frac;
            }
        });
    svg_viz_container.call(tip);

    return tip
}

/**
 * Draw the projective reals line on an SVG.
 * @param width The width of the SVG container
 * @param height The height of the SVG container
 * @param n Current N value of the visualization
 * @param es Current ES value of the visualization
 * @param format Current format setting, fractions or bitstrings
 */
function drawProjectiveRealsLine(width, height, n, es, format) {
    // An assumption I'm making right now.
    console.assert(width === height);

    // Create a defs block; define arrowhead and dot markers.
    var arrowheadMarker = createArrowheadMarker();
    var arrowheadMarkerId = d3.select(arrowheadMarker).attr('id');
    // var reverseArrowheadMarker = createReverseArrowheadMarker();
    // var reverseArrowheadMarkerId = d3.select(reverseArrowheadMarker).attr('id');
    var dotMarker = createDotMarker();
    var dotMarkerId = d3.select(dotMarker).attr('id');

    // This weird syntax is what d3 expects:
    // https://stackoverflow.com/questions/23110366/d3-append-with-variable
    var defs = svg_viz_container.append('defs');
    defs.append(function () {return arrowheadMarker;});
    defs.append(function(){return dotMarker;});

    const posits = generatePositsOfLength(n, es);

    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    const infinity = posits.filter(p => p.value === Infinity);
    const zero = posits.filter(p => p.value === 0.0);

    var dtheta = calculateDTheta(n);
    var radius = calculateRadius(n);
    var x_center = width/2;
    var y_center = calculateYCenter(n);

    drawPositivePath(x_center, y_center, radius, zero, arrowheadMarkerId)
    drawNegativePath(x_center, y_center, radius, zero, arrowheadMarkerId)

    drawPositiveDots(x_center, y_center, positivePosits, n, es)
    drawNegativeDots(x_center, y_center, negativePosits, n, es)

    if (displayFormat === label_format.FRACTION) {
        drawFractionLabels(width, height, n, es);
    }
    else {
        drawBitstringLabels(width, height, n, es);
    }

    drawZero(x_center, y_center, radius, zero, format)
    drawInfinityDot(x_center, y_center, radius, infinity, format)
}


// TODO(gus) do we need so much separation between drawing labels as fractions
// or as bitstrings?
/** @brief Draw labels corresponding to the fractional posit values on the visualization
 * @param width The width of the SVG container
 * @param height The height of the SVG container
 * @param n Current N value of the visualization
 * @param es Current ES value of the visualization
 */
function drawFractionLabels(width, height, n, es) {
    var radius = calculateRadius(n)

    // TODO(gus) we should try to generate the posits in just one place---where should that be?
    const posits = generatePositsOfLength(n, es);
    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    var params = {
        x_center: width/2,
        y_center: calculateYCenter(n),
        text_radius: calculateTextRadius(radius),
        dtheta: calculateDTheta(n),
        n: n,
        es: es
    };

    var texts = svg_viz_container.selectAll('.negativeText').data(negativePosits);
    setFracTextAttrs(texts.enter().append('text'), params, 1, 'negativeText');
    setFracTextAttrs(texts, params, 1, 'negativeText');
    texts.exit().remove();
    texts = svg_viz_container.selectAll('.positiveText').data(positivePosits);
    setFracTextAttrs(texts.enter().append('text'), params, 0, 'positiveText');
    setFracTextAttrs(texts, params, 0, 'positiveText');
    texts.exit().remove();
}

/** @brief Set the D3 attributes of fractional text elements
 *  @param text_var D3 set that we're setting attributes for
 *  @param sign 1 for negative posits, 0 for positive posits
 *  @param classString String that describes the D3 class of the text_var
 */
function setFracTextAttrs(text_var, params, sign, classString) {
    var anchor_pos;
    if (sign === 1) {
        anchor_pos = 'end'
    }
    else {
        anchor_pos = 'start'
    }
    text_var
        .attr('transform', function(d, i) {
            var coord = getDotCoordsFromPosit(params.x_center,
                                              params.y_center,
                                              params.text_radius,
                                              params.dtheta, d);
            var rotate = d.actualValueBitfields.sign[0] === 1 ?
                coord.endAngle + 90 : coord.endAngle - 90;
            // Note: order of transforms matters!
            return "translate(" + coord.x +"," + coord.y + ")"
                + " rotate(" + rotate + ")";
        })
        .attr('font-family', 'sans-serif')
    // TODO(gus) no need to define anchor_pos above. Instead, use a function
    // like you do in the 'transform' case above, and then decide anchor based
    // on d.sign
        .attr('text-anchor', anchor_pos)
        .attr('class', classString)
        .style("fill", "black")
        .text((d) => decodePosit(d.bitstring, params.n, params.es).value);
}


/** @brief Draw labels corresponding to the posit bitstrings on the visualization
 * @param svgSelection - the d3 selection of the SVG element.
 * @param width The width of the SVG container
 * @param height The height of the SVG container
 * @param n Current N value of the visualization
 * @param es Current ES value of the visualization
 */
function drawBitstringLabels(width, height, n, es) {
    var radius = calculateRadius(n)

    const posits = generatePositsOfLength(n, es);
    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    var params = {
        x_center: width/2,
        y_center: calculateYCenter(n),
        text_radius: calculateTextRadius(radius),
        n:n,
        es:es,
        dtheta:calculateDTheta(n),
    }

    var texts = svg_viz_container.selectAll('.negativeText').data(negativePosits)
    setBitstringTextAttrs(texts.enter().append('text'), params, 1, 'negativeText')
    setBitstringTextAttrs(texts, params, 1, 'negativeText')
    texts.exit().remove()

    texts = svg_viz_container.selectAll('.positiveText').data(positivePosits)
    setBitstringTextAttrs(texts.enter().append('text'), params, 0, 'positiveText')
    setBitstringTextAttrs(texts, params, 0, 'positiveText')
    texts.exit().remove()
}

/** @brief Set the D3 attributes of bitstring text elements
 *  @param text_var D3 set that we're setting attributes for
 *  @param sign 1 for negative posits, 0 for positive posits
 *  @param classString String that describes the D3 class of the text_var
 */
function setBitstringTextAttrs(text_var, params, sign, classString) {
    var anchor_pos;
    if (sign === 1) {
        anchor_pos = 'end'
    }
    else {
        anchor_pos = 'start'
    }

    text_var
    // For whatever reason, 'transform' rotate doesn't play well with x and y
    // attrs. So we just use translate instead of x and y.
        .attr('transform', function(d, i) {
            var coord = getDotCoordsFromPosit(params.x_center,
                                              params.y_center,
                                              params.text_radius,
                                              params.dtheta, d);
            var rotate = d.actualValueBitfields.sign[0] === 1 ?
                coord.endAngle + 90 : coord.endAngle - 90;
            // Note: order of transforms matters!
            return "translate(" + coord.x +"," + coord.y + ")"
                + " rotate(" + rotate + ")";
        })
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', anchor_pos)
        .attr('class', classString)
        .style("fill", COLORS[0])
        .text((d) => d.rawBitfields.sign.join(""))
        .append("tspan")
        .style("fill", COLORS[1])
        .text((d) => d.rawBitfields.regime.join(""))
        .append("tspan")
        .style("fill", COLORS[2])
        .text((d) => d.rawBitfields.exponent.join(""))
        .append("tspan")
        .style("fill", COLORS[3])
        .text((d) => d.rawBitfields.fraction.join(""))
}


/** @brief Set how mouse movements interact with the tooltip
 *  @param tip D3 tooltip object from createTooltip
 */
function setMouseInteraction(tip) {
    mouseInteractionHelper(svg_viz_container.selectAll('.positiveDot'), tip)
    mouseInteractionHelper(svg_viz_container.selectAll('.negativeDot'), tip)
    mouseInteractionHelper(svg_viz_container.selectAll('.zeroDot'), tip)
    mouseInteractionHelper(svg_viz_container.selectAll('.infDot'), tip)
}

/** @brief Sets how mouse movements interact with the tooltip for
 *  the given set of nodes
 */
function mouseInteractionHelper(nodes, tip) {
    nodes
        .on('mouseover', function(d) {
            d3.select(this)
              .attr('r', dot_radius.FOCUSED)
              .style('opacity', dot_opacity.FOCUSED);
            tip.show(d, this);}
        )
        .on('mouseout', function(d) {
            d3.select(this)
              .attr('r', dot_radius.UNFOCUSED)
              .style('opacity', dot_opacity.UNFOCUSED);
            tip.hide();
        });
}


/** @brief Draw the arc for the positive posits
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param radius The radius of the circle
 *  @param zero The posit corresponding to zero
 *  @param arrowheadMarkerId ID for the arrowhead marker that appears at the end of the arc
*/
function drawPositivePath(x_center, y_center, radius, zero, arrowheadMarkerId) {
    var positivePath = svg_viz_container.selectAll('.positivePositPath').data(zero);
    positivePath.enter().append('path')
        .attr('class', 'positivePositPath')
        .attr('d', describeArc(x_center, y_center, radius, 0, 180, 3))
        .attr('stroke-width', '3')
        .attr('stroke', '#2464FF')
        .attr('fill', 'none')
        .attr('marker-end', 'url(#' + arrowheadMarkerId + ')')
        .each(function(d) { this._current_n = d.bitstring.length; }) ;
    positivePath
        .transition().duration(750).attrTween('d', positivePathTween)
    positivePath.exit().remove()

}

function positivePathTween(a) {
    var current_n = this._current_n;
    var next_n = a.bitstring.length;
    var current_arc_params =
                      {x_center: width/2,
                      y_center: calculateYCenter(current_n),
                      radius: calculateRadius(current_n)};
    var next_arc_params =
                      {x_center: width/2,
                       y_center: calculateYCenter(next_n),
                          radius: calculateRadius(next_n)};
    var inter = d3.interpolateObject(current_arc_params, next_arc_params);
    this._current_n = next_n;
    return function(t) {
        return describeArc(inter(t).x_center, inter(t).y_center,
            inter(t).radius, 0, 180, 3);
    };
}

/** @brief Draw the dots that correspond to positive posits on the arc
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param posits The positive valued posits that correspond to the points we're drawing
 *  @param n Current N value of the visualization
 *  @param es Current ES value of the visualization
 */
function drawPositiveDots(x_center, y_center, posits, n, es) {
    var radius = calculateRadius(n)
    var dtheta = calculateDTheta(n)

    var dots = svg_viz_container.selectAll('.positiveDot').data(posits)
    dots.enter().append('circle')
        .attr('class', 'positiveDot')
        .attr('transform', function(d) {
            var coords = getDotCoordsFromPosit(x_center, y_center, radius, dtheta, d);
            return "translate(" + coords.x + "," + coords.y + ")"})
        .attr('r', 5)
        .style('opacity', 1E-6)
        .attr('fill', 'black')
        .transition()
        .duration(750)
        .style('opacity', dot_opacity.UNFOCUSED)
    dots
        .transition()
        .duration(750)
        .attr('transform', function(d) {
            var coords = getDotCoordsFromPosit(x_center, y_center, radius, dtheta, d);
            return "translate(" + coords.x + "," + coords.y + ")"})
    dots.exit().remove()

}


/** @brief Draw the arc for the negative posits
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param radius The radius of the circle
 *  @param zero The posit corresponding to zero
 *  @param arrowheadMarkerId ID for the arrowhead marker that appears at the end of the arc
*/
function drawNegativePath(x_center, y_center, radius, zero, arrowheadMarkerId) {
    // negative arc
    var negativePath = svg_viz_container.selectAll('.negativePositPath').data(zero);
    negativePath.enter().append('path')
        .attr('class', 'negativePositPath')
        .attr('d', describeArc(x_center, y_center, radius, 1, 180, 357))
        .attr('stroke-width', '3')
        .attr('stroke', '#FF0000')
        .attr('fill', 'none')
        .attr('marker-end', 'url(#' + arrowheadMarkerId + ')')
        .each(function(d) { this._current_n = d.bitstring.length; }) ;
    negativePath
        .transition().duration(750).attrTween('d', negativePathTween)
    negativePath.exit().remove()

}

function negativePathTween(a) {
    var current_n = this._current_n;
    var next_n = a.bitstring.length;
    var current_arc_params =
                      {x_center: width/2,
                      y_center: calculateYCenter(current_n),
                      radius: calculateRadius(current_n)};
    var next_arc_params =
                      {x_center: width/2,
                       y_center: calculateYCenter(next_n),
                          radius: calculateRadius(next_n)};
    var inter = d3.interpolateObject(current_arc_params, next_arc_params);
    this._current_n = next_n;
    return function(t) {
        return describeArc(inter(t).x_center, inter(t).y_center,
            inter(t).radius, 1, 180, 357);
    };
}

/** @brief Draw the dots that correspond to negative posits on the arc
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param posits The negative valued posits that correspond to the points we're drawing
 *  @param n Current N value of the visualization
 *  @param es Current ES value of the visualization
 */
function drawNegativeDots(x_center, y_center, posits, n, es) {
    var radius = calculateRadius(n)
    var dtheta = calculateDTheta(n)

    var dots = svg_viz_container.selectAll('.negativeDot').data(posits)
    dots.enter().append('circle')
        .attr('class', 'negativeDot')
        .attr('transform', function(d) {
            var coords = getDotCoordsFromPosit(x_center, y_center, radius, dtheta, d);
            return "translate(" + coords.x + "," + coords.y + ")"})
        .style('opacity', 1E-6)
        .attr('r', 5)
        .attr('fill', 'black')
        .transition()
        .duration(750)
        .style('opacity', dot_opacity.UNFOCUSED)
    dots
        .transition()
        .duration(750)
        .attr('transform', function(d) {
            var coords = getDotCoordsFromPosit(x_center, y_center, radius, dtheta, d);
            return "translate(" + coords.x + "," + coords.y + ")"})
    dots.exit().remove()
}


/** @brief Draw the single point at the top of the visualization that corresponds to
 *         a fractional value of infinity
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param radius The radius of the posit circle
 *  @param infinity The Posit for infinity
 *  @param format Current format setting for the visualization, either
 *                fraction or bitstring
 */
function drawInfinityDot(x_center, y_center, radius, infinity, format) {
    var infinityDot = svg_viz_container.selectAll('.infDot').data(infinity);
    var text_radius = radius + 15 + 5 * (infinity[0].bitstring.length - 2)
    var circle_top = y_center - radius;


    var dotText = (format == label_format.FRACTION) ? "Infinity" : ((d) => d.bitstring.join(""));
    infinityDot.enter().append('circle')
        .attr('class', 'infDot')
        .attr('transform', "translate(" + x_center + "," + circle_top + ")")
        .attr('r', 5)
        .attr('fill', 'black')
        .style('opacity', 1E-6)
        .transition()
        .duration(750)
        .style('opacity', dot_opacity.UNFOCUSED)

    infinityDot
        .transition()
        .duration(750)
        .attr('transform', "translate(" + x_center + "," + circle_top + ")");

    infinityDot.exit().remove();

    text = svg_viz_container.selectAll('.infText').data(infinity)
    text.enter().append('text')
        .attr('class', 'infText')
        .attr('x', x_center)
        .attr('y', y_center - text_radius)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .text(dotText);

    text
        .attr('x', x_center)
        .attr('y', y_center - text_radius)
        .text(dotText);

    text.exit().remove()
}

/** @brief Draw the single point at the bottom of the visualization that corresponds to
 *         a fractional value of zero
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param radius The radius of the posit circle
 *  @param zero The Posit for zero
 *  @param format Current format setting for the visualization, either
 *                fraction or bitstring
 */
function drawZero(x_center, y_center, radius, zero, format) {
    var zeroDot = svg_viz_container.selectAll('.zeroDot').data(zero);
    var text_radius = radius + 15 + 5 * (zero[0].bitstring.length - 2)
    var circle_bottom = y_center + radius;

    zeroDot.enter().append('circle')
        .attr('class', 'zeroDot')
        .attr('transform', "translate(" + x_center + "," + circle_bottom + ")")
        .attr('r', 5)
        .attr('fill', 'black')
        .style('opacity', 1E-6)
        .transition()
        .duration(750)
        .style('opacity', dot_opacity.UNFOCUSED)

    zeroDot
        .transition()
        .duration(750)
        .attr('transform', "translate(" + x_center + "," + circle_bottom + ")")
    zeroDot.exit().remove();

    zero_text = (format == label_format.FRACTION) ? "0" : ((d) => d.bitstring.join(""));

    text = svg_viz_container.selectAll('.zeroText').data(zero);
    text.enter().append('text')
        .attr('class', 'zeroText')
        .attr('x', x_center)
        .attr('y', y_center + text_radius)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .text(zero_text);

    text
        .attr('x', x_center)
        .attr('y', y_center + text_radius)
        .text(zero_text);
    text.exit().remove();
}



// TODO Everything below here could probably be moved into a separate "viz-lib" file
/**
 * @brief Create an arrowhead <marker> element to be appended to an <svg> (within a
 *        <defs>).
 *
 * See https://vanseodesign.com/web-design/svg-markers/.
 * @return The arrowhead <marker> element
 */
function createArrowheadMarker() {
    var id = 'arrowhead';
    var markerWidth = '10';
    var markerHeight = '10';
    var refX = '7';
    var refY = '3';
    var orient = 'auto';
    var markerUnits = 'strokeWidth';

    // See https://stackoverflow.com/questions/28734628/how-can-i-set-an-attribute-with-case-sensitive-name-in-a-javascript-generated-el
    // We create an XML element instead of an HTML element. HTML attributes are
    // case-insensitive, and so the attributes below get lowercased if we don't
    // do this.
    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    d3.select(marker)
        .attr('id', id)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerHeight)
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('orient', orient)
        .attr('markerUnits', markerUnits)
        .append('path')
        .attr('d', 'M0,0 L0,6 L9,3 z')
        .attr('fill', 'black');

    return marker;
}

/**
 * @brief Create a dot <marker> element to be appended to an <svg> (within a <defs>).
 * @return The arrowhead <marker> element
 */
function createDotMarker() {
    var id = 'dot';
    var markerWidth = '10';
    var markerHeight = '10';
    var refX = '5';
    var refY = '5';
    var orient = 'auto';
    var markerUnits = 'strokeWidth';
    var radius = '3';

    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    d3.select(marker)
        .attr('id', id)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerHeight)
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('orient', orient)
        .attr('markerUnits', markerUnits)
        .append('circle')
        .attr('cx', '5')
        .attr('cy', '5')
        .attr('r', radius)
        .attr('fill', 'black');

    return marker;
}

/** @brief Given a Posit value and the circle's center and radius, get the X
 *         and Y coordinates that the given Posit's dot should be drawn at
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param radius The radius of the posit circle
 *  @param dtheta The angle change between posits on the circle
 *  @param posit The Posit value
 */
function getDotCoordsFromPosit(x_center, y_center, radius, dtheta, posit) {
    var posit_as_int = unsignedIntegerFromBitstring(posit.bitstring);
    var infVal = 2**(posit.bitstring.length - 1);
    var end_angle;
    if (posit.rawBitfields.sign[0] === 0) {
        end_angle = 180 - (dtheta * posit_as_int)
    } else {
        // Semi-hacky correction so that negative posits go
        // from most negative to least negative
        if (posit.value != Infinity) { posit_as_int = Math.abs(infVal - (posit_as_int - infVal));}
        end_angle = 180 + (dtheta * (posit_as_int))
    }
    return {
        endAngle:end_angle,
        x:polarToCartesian(x_center, y_center, radius, end_angle).x,
        y:polarToCartesian(x_center, y_center, radius, end_angle).y
    };
}

/* Angles start at the top of the circle and go clockwise, we drawn arcs for positive
 * numbers counter-clockwise and arcs for negative numbers clockwise.
 * If sign is 0, the arc is drawn from start->end otherwise we drawn from end->start
 * x and y are coordinates of the center
 *
 * https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
 */
function describeArc(x, y, radius, sign, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, startAngle);
    var end = polarToCartesian(x, y, radius, endAngle);

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, 0, sign, end.x, end.y
    ].join(" ");
    return d;
}

/**
 * Following two functions based on this:
 * https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function calculateRadius(n) {
    // TODO(gus) magic numbers
    return ((n/2) * 100) + (2**(n/2) * 3);
}

function calculateTextRadius(radius) {
    return radius + 20;
}

function calculateYCenter(n) {
    return calculateRadius(n) + (n * 5);
}

function calculateDTheta(n) {
    // TODO(gus) magic numbers
    return 178/(1 << (n-1));
}
