// @note svg_viz_container is a global variable defined in index.html
COLORS = ["#FF2100", "#C98700", "#2867FF", "magenta"];

/**
 * Update data with new posit parameters.
 *
 * Regenerates set of posits, splits them into positive, negative, zero, and
 * infinity; binds new set of data to the viz.
 */
function update(width, height, n, es) {
    drawProjectiveRealsLine(width, height, n, es);
    createLegend();
    createTooltip(n, es);
}

function drawControls(width) {
    var y_center = calculateYCenter(4);
    var es_slider_start = (width / 2) - (es_slider_width / 2);
    var n_slider_start = (width / 2) - (n_slider_width / 2);
    var n_slider_y = y_center - 100;
    var es_slider_y = y_center - 40;
    var format_button_y = y_center + 25;
    var scale_button_y = format_button_y + 35;
    var button_width = 150;

    svg_viz_container.append('g')
        .attr('class', 'n_slider')
        .attr('width', n_slider_width + 100)
        .attr('height', 100)
        .attr('align', 'center')
        .attr('transform', `translate(${n_slider_start},${n_slider_y})`)
        .attr('id', 'n_slider')
        .call(sliderN);

    svg_viz_container.append('g')
        .attr('class', 'es_slider')
        .attr('width', es_slider_width + 100)
        .attr('height', 100)
        .attr('align', 'center')
        .attr('transform', `translate(${es_slider_start},${es_slider_y})`)
        .attr('id', 'es_slider')
        .call(sliderES);


     svg_viz_container.append('text')
        .attr("transform", `translate(${n_slider_start-25},${n_slider_y+5})`)
        .style('text-anchor', 'middle')
        .style('font-weight', 700)
        .text("N:");

     svg_viz_container.append('text')
        .attr("transform", `translate(${es_slider_start-25},${es_slider_y+5})`)
        .style('text-anchor', 'middle')
        .style('font-weight', 700)
        .text("ES:");

    svg_viz_container.append('text')
        .attr("transform", `translate(${width / 2},${format_button_y})`)
        .style('text-anchor', 'middle')
        .style('font-weight', 400)
        .text('See Fraction Values')
        .on('click', function (d) {
            if (d3.select(this).text() == 'See Fraction Values') {
                d3.select(this).text('See Bitstring Values');
                displayFormat = label_format.FRACTION;
            } else {
                d3.select(this).text('See Fraction Values');
                displayFormat = label_format.BITSTRING;
            }
            update(width, height, n, es);
        });

    svg_viz_container.append('rect')
        .attr('width', button_width)
        .attr('height', 30)
        .style('fill', 'none')
        .style('stroke', 'black')
        .attr('rx', 10)
        .attr('transform', `translate(${width / 2 - button_width/2}, ${format_button_y-20})`);

    svg_viz_container.append('text')
        .attr("transform", `translate(${width / 2},${scale_button_y})`)
        .style('text-anchor', 'middle')
        .style('font-weight', 400)
        .text('Ordinal Scale')
        .on('click', function (d) {
            if (scaleFormat == scale_format.ORDINAL) {
                d3.select(this).text('Linear Scale');
                scaleFormat = scale_format.LINEAR;
            } else if (scaleFormat == scale_format.LINEAR) {
                d3.select(this).text('Log Scale');
                scaleFormat = scale_format.LOG;
            } else {
                d3.select(this).text('Ordinal Scale');
                scaleFormat = scale_format.ORDINAL;
            }
            update(width, height, n, es);
        });

    svg_viz_container.append('rect')
        .attr('width', button_width)
        .attr('height', 30)
        .style('fill', 'none')
        .style('stroke', 'black')
        .attr('rx', 10)
        .attr('transform', `translate(${width / 2 - button_width/2}, ${scale_button_y-20})`);
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
        .style('fill', color);

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
            var decode = decodePosit(d.bitstring, n, es);
            if (decode.infinity) {
                return "Infinity";
            } else if (decode.zero) {
                return "Zero";
            } else {
                // We want to color the text in the tooltip, HTML Span elements are a useful hack
                var value = String(decode.value) + " = ";
                var sign = `<span style="color:${(COLORS[0])}">${(decode.calc.sign)}</span>`;
                var useed = `<span style="color:${(COLORS[1])}">${(decode.calc.useed)}</span>`;
                var k = `<span style="color:${(COLORS[1])}">${(decode.calc.k)}</span>`;
                var exp = `<span style="color:${(COLORS[2])}">${(decode.calc.exp)}</span>`;
                var frac = `<span style="color:${(COLORS[3])}">${(decode.calc.frac)}</span>`;
                return value + sign + " * " + useed + "^" + k + " * " +
                    String(2) + "^" + exp + " * " + frac;
            }
        });
    svg_viz_container.call(tip);

    // Set how mouse movements interact with the tooltip
    mouseInteractionHelper(svg_viz_container.selectAll('.positiveDot'), tip);
    mouseInteractionHelper(svg_viz_container.selectAll('.negativeDot'), tip);
    mouseInteractionHelper(svg_viz_container.selectAll('.zeroDot'), tip);
    mouseInteractionHelper(svg_viz_container.selectAll('.infDot'), tip);
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


/**
 * Draw the projective reals line on an SVG.
 * @param width The width of the SVG container
 * @param height The height of the SVG container
 * @param n Current N value of the visualization
 * @param es Current ES value of the visualization
 * @param format Current format setting, fractions or bitstrings
 */
function drawProjectiveRealsLine(width, height, n, es) {
    // An assumption I'm making right now.
    console.assert(width === height);

    // Create a defs block; define arrowhead and dot markers.
    var arrowheadMarker = createArrowheadMarker();
    var arrowheadMarkerId = d3.select(arrowheadMarker).attr('id');

    var dotMarker = createDotMarker();
    var dotMarkerId = d3.select(dotMarker).attr('id');

    // This weird syntax is what d3 expects:
    // https://stackoverflow.com/questions/23110366/d3-append-with-variable
    var defs = svg_viz_container.append('defs');
    defs.append(function () {return arrowheadMarker;});
    defs.append(function(){return dotMarker;});

    var radius = calculateRadius(n);
    var x_center = width/2;
    var y_center = calculateYCenter(n);
    const posits = generatePositsOfLength(n, es);

    drawPath(x_center, y_center, radius, posits.zero,
             arrowheadMarkerId, psign.POSITIVE);
    drawPath(x_center, y_center, radius, posits.zero,
             arrowheadMarkerId, psign.NEGATIVE);

    // drawing the brush has to come before drawing the dots or the hovering doesn't work
    drawBrush(x_center, y_center, radius, posits);

    drawDots(x_center, y_center, posits.pos, n, es, psign.POSITIVE);
    drawDots(x_center, y_center, posits.neg, n, es, psign.NEGATIVE);

    drawLabels(posits.pos, width, height, n, es, displayFormat, psign.POSITIVE);
    drawLabels(posits.neg, width, height, n, es, displayFormat, psign.NEGATIVE);

    drawZero(x_center, y_center, radius, posits.zero, displayFormat);
    drawInfinityDot(x_center, y_center, radius, posits.inf, displayFormat);

}


/** @brief Draw labels corresponding to the fractional posit values on the visualization
 * @param posits Posits that we're visualizing
 * @param width The width of the SVG container
 * @param height The height of the SVG container
 * @param n Current N value of the visualization
 * @param es Current ES value of the visualization
 */
function drawLabels(posits, width, height, n, es, format, sign) {
    var class_str;
    if (sign == psign.POSITIVE) {
        class_str = "negativeText";
    } else {
        class_str = "positiveText";
    }
    var radius = calculateRadius(n);

    var params = {
        x_center: width/2,
        y_center: calculateYCenter(n),
        text_radius: calculateTextRadius(radius),
        dtheta: calculateDTheta(n, posits),
        n: n,
        es: es
    };

    var texts = svg_viz_container.selectAll('.'.concat(class_str)).data(posits);
    setTextAttrs(texts.enter().append('text'), params, sign, class_str, format);
    setTextAttrs(texts, params, sign, class_str, format);
    texts.exit().remove();
}

/** @brief Set the D3 attributes of fractional text elements
 *  @param text_var D3 set that we're setting attributes for
 *  @param sign 1 for negative posits, 0 for positive posits
 *  @param classString String that describes the D3 class of the text_var
 *  @param format Whether we're displaying fractions or bitstrings
 */
function setTextAttrs(text_var, params, sign, classString, format) {
    var anchor_pos = (sign === psign.NEGATIVE) ? 'end' : 'start';
    text_var
    // For whatever reason, 'transform' rotate doesn't play well with x and y
    // attrs. So we just use translate instead of x and y.
        .attr('transform', function(d, i) {
            var coord = getDotCoordsFromPosit(params.x_center,
                                              params.y_center,
                                              params.text_radius,
                                              params.dtheta[i], d);
            var rotate = d.actualValueBitfields.sign[0] === psign.NEGATIVE ?
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
        .attr('class', classString);

    if (format == label_format.FRACTION) {
        text_var
            .style("fill", "black")
            .text((d) => formatFractionalString(d.bitstring, params.n, params.es));
    } else {
        text_var
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
            .text((d) => d.rawBitfields.fraction.join(""));
    }
}

/** @brief Helper function for formatting the text displayed for the fractional posit representations 
 *  @param bitstring the bitstring representation of the posit
 *  @param n the current N value to be used for decoding the posit
 *  @param es the current es value to be used for decoding the posit
 *  @return A formatted string to be set as label text on the circle
 */
function formatFractionalString(bitstring, n, es) {
    var frac_posit_value = decodePosit(bitstring, n, es).value;
    var string;
    if (Math.abs(frac_posit_value) < 0.00001
        || Math.abs(frac_posit_value) > 99999) {
        string = frac_posit_value.toExponential(5).toString();
    }
    else {
        string = parseFloat(frac_posit_value.toFixed(5)).toString();
    }
    return string;
}

/** @brief Draw an arc for the posits
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param radius The radius of the circle
 *  @param zero The posit corresponding to zero
 *  @param arrowheadMarkerId ID for the arrowhead marker that appears at the end of the arc
 *  @param sign 0 to draw the positive arc, 1 to draw the negative arc
*/
function drawPath(x_center, y_center, radius, zero, arrowheadMarkerId, sign) {
    var animation_len = 750;
    if (sign == psign.POSITIVE) { // positive path
        arc = describeArc(x_center, y_center, radius, psign.POSITIVE, 180, 3);
        color = '#2464FF';
        className = "positivePositPath";
        transitionFunc = positivePathTween;
    } else {
        arc = describeArc(x_center, y_center, radius, psign.NEGATIVE, 180, 357);
        color = '#FF0000';
        className = "negativePositPath";
        transitionFunc = negativePathTween;
    }

    var path = svg_viz_container.selectAll('.'.concat(className)).data(zero);
    path.enter().append('path')
        .attr('class', className)
        .attr('d', arc)
        .attr('stroke-width', '3')

        .attr('stroke', color)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#' + arrowheadMarkerId + ')')
        .each(function(d) { this._current_n = d.bitstring.length; }) ;
    path.transition().duration(animation_len).attrTween('d', transitionFunc);
    path.exit().remove();
}

/**
 * @brief This function defines the transition function that should be used for transitioning
 *        between arcs of different sizes when N changes. This gets passed as the
 *        transitioning function to .attrTween
 *        Note: This is almost identical to negativePathTween. However, for some reason, when 
 *        trying to pass other parameters, it's impossible to use the this keyword, which we 
 *        need to get the initial state of the arc
 * @param a the current datapoint bound to the object
 * @return A function that can be passed a parameter to generate an arc object. A paramter
 *         of 0 is the original arc and a parameter of 1 is the final arc
 */
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
            inter(t).radius, psign.POSITIVE, 180, 3);
    };
}

/** @brief Draw the dots that correspond to positive posits on the arc
 *  @param x_center The x coordinate of the center of the circle
 *  @param y_center The y coordinate of the center of the circle
 *  @param posits The positive valued posits that correspond to the points we're drawing
 *  @param n Current N value of the visualization
 *  @param es Current ES value of the visualization
 *  @param sign 0 for positive posits, 1 for negative posits
 */
function drawDots(x_center, y_center, posits, n, es, sign) {
    var radius = calculateRadius(n);
    var dtheta = calculateDTheta(n, posits);
    className = (sign == psign.POSITIVE) ? 'positiveDot' : 'negativeDot';

    var dots = svg_viz_container.selectAll('.'.concat(className)).data(posits);
    dots.enter().append('circle')
        .attr('class', className)
        .attr('transform', function(d, i) {
            var coords = getDotCoordsFromPosit(x_center, y_center, radius, dtheta[i], d);
            return "translate(" + coords.x + "," + coords.y + ")";})
        .style('opacity', 1E-6)
        .attr('r', 5)
        .attr('fill', 'black')
        .transition()
        .duration(750)
        .style('opacity', dot_opacity.UNFOCUSED);
    dots
        .transition()
        .duration(750)
        .attr('transform', function(d, i) {
            var coords = getDotCoordsFromPosit(x_center, y_center, radius, dtheta[i], d);
            return "translate(" + coords.x + "," + coords.y + ")";});
    dots.exit().remove();
}


/**
 * @brief This function defines the transition function that should be used for transitioning
 *        between arcs of different sizes when N changes. This gets passed as the
 *        transitioning function to .attrTween
 *        Note: This is almost identical to positivePathTween. However, for some reason, when 
 *        trying to pass other parameters, it's impossible to use the this keyword, which we 
 *        need to get the initial state of the arc
 * @param a the current datapoint bound to the object
 * @return A function that can be passed a parameter to generate an arc object. A paramter
 *         of 0 is the original arc and a parameter of 1 is the final arc
 */
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
            inter(t).radius, psign.NEGATIVE, 180, 357);

    };
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
    var text_radius = radius + 15 + 5 * (infinity[0].bitstring.length - 2);
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
        .style('opacity', dot_opacity.UNFOCUSED);

    infinityDot
        .transition()
        .duration(750)
        .attr('transform', "translate(" + x_center + "," + circle_top + ")");


    infinityDot.exit().remove();

    text = svg_viz_container.selectAll('.infText').data(infinity);
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

    text.exit().remove();
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
    var text_radius = radius + 15 + 5 * (zero[0].bitstring.length - 2);
    var circle_bottom = y_center + radius;

    zeroDot.enter().append('circle')
        .attr('class', 'zeroDot')
        .attr('transform', "translate(" + x_center + "," + circle_bottom + ")")
        .attr('r', 5)
        .attr('fill', 'black')
        .style('opacity', 1E-6)
        .transition()
        .duration(750)
        .style('opacity', dot_opacity.UNFOCUSED);

    zeroDot
        .transition()
        .duration(750)
        .attr('transform', "translate(" + x_center + "," + circle_bottom + ")");
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
    if (posit.rawBitfields.sign[0] === psign.POSITIVE) {
        end_angle = 180 - dtheta;
    } else {
        // Semi-hacky correction so that negative posits go
        // from most negative to least negative
        end_angle = 180 + dtheta;
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
