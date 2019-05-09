COLORS = ["#FF2100", "#C98700", "#2867FF", "magenta"]


/**
 * Update data with new posit parameters.
 *
 * Regenerates set of posits, splits them into positive, negative, zero, and
 * infinity; attaches new set of data to the viz.
 */
function update(contianer, width, height, n, es, format) {
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
    drawProjectiveRealsLine(container, width, height, n, es, format);
    createLegend(container);
    createTooltip(container, n, es);
}


function drawInfinityDot(container, x_center, y_center, radius, infinity, format) {
    var infinityDot = container.selectAll('.infDot').data(infinity);
    var text_radius = radius + 15 + 5 * (infinity[0].bitstring.length - 2)


    var dotText = (format == label_format.FRACTION) ? "Infinity" : ((d) => d.bitstring.join(""));
    infinityDot.enter().append('circle')
        .attr('class', 'infDot')
        .attr('cx', x_center)
        .attr('cy', y_center - radius)
        .attr('r', 5)
        .attr('fill', 'black');

    infinityDot
        .attr('cx', x_center)
        .attr('cy', y_center - radius)

    infinityDot.exit().remove();

    text = container.selectAll('.infText').data(infinity)
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

function drawZero(container, x_center, y_center, radius, zero, format) {
    var zeroDot = container.selectAll('.zeroDot').data(zero);
    var text_radius = radius + 15 + 5 * (zero[0].bitstring.length - 2)

    zeroDot.enter().append('circle')
        .attr('class', 'zeroDot')
        .attr('cx', x_center)
        .attr('cy', y_center + radius)
        .attr('r', 5)
        .attr('fill', 'black');

    zeroDot
        .attr('cx', x_center)
        .attr('cy', y_center + radius)

    zeroDot.exit().remove();
    zero_text = (format == label_format.FRACTION) ? "0" : ((d) => d.bitstring.join(""));

    text = container.selectAll('.zeroText').data(zero);
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


function calculateRadius(n) {
    // TODO(gus) magic numbers
    return ((n/2) * 100) + (2**(n/2) * 3);
}

function calculateYCenter(n) {
    return calculateRadius(n) + (n * 5);
}

function calculateDTheta(n) {
    // TODO(gus) magic numbers
    return 178/(1 << (n-1));
}

// TODO(gus) do we need so much separation between drawing labels as fractions
// or as bitstrings?
function setFracTextAttrs(text_var, params, sign, classString) {
    text_var
        .attr('transform', function(d, i) {
            var coord = getDotCoordsFromPosit(params.x_center,
                                              params.y_center,
                                              params.text_radius,
                                              params.dtheta, sign, d);
            var rotate = d.actualValueBitfields.sign[0] === 1 ?
                coord.endAngle + 90 : coord.endAngle - 90;
            // Note: order of transforms matters!
            return "translate(" + coord.x +"," + coord.y + ")"
                + " rotate(" + rotate + ")";
        })
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', classString)
        .style("fill", "black")
        .text((d) => decodePosit(d.bitstring, params.n, params.es).value);
}

function drawFractionLabels(container, width, height, n, es) {
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
        text_radius: radius + 15 + 5 * (posits[0].bitstring.length - 2),
        dtheta: calculateDTheta(n),
        n: n,
        es: es
    };

    var texts = container.selectAll('.negativeText').data(negativePosits);
    setFracTextAttrs(texts.enter().append('text'), params, 1, 'negativeText');
    setFracTextAttrs(texts, params, 1, 'negativeText');
    texts.exit().remove();
    texts = container.selectAll('.positiveText').data(positivePosits);
    setFracTextAttrs(texts.enter().append('text'), params, 0, 'positiveText');
    setFracTextAttrs(texts, params, 0, 'positiveText');
    texts.exit().remove();
}

function setBitstringTextAttrs(text_var, params, sign, classString) {
    text_var
    // For whatever reason, 'transform' rotate doesn't play well with x and y
    // attrs. So we just use translate instead of x and y.
        .attr('transform', function(d, i) {
            var coord = getDotCoordsFromPosit(params.x_center,
                                              params.y_center,
                                              params.text_radius,
                                              params.dtheta, sign, d);
            var rotate = d.actualValueBitfields.sign[0] === 1 ?
                coord.endAngle + 90 : coord.endAngle - 90;
            // Note: order of transforms matters!
            return "translate(" + coord.x +"," + coord.y + ")"
                + " rotate(" + rotate + ")";
        })
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
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

function drawBitstringLabels(container, width, height, n, es) {
    var radius = calculateRadius(n)

    const posits = generatePositsOfLength(n, es);
    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    var params = {
        x_center: width/2,
        y_center: calculateYCenter(n),
        text_radius: radius + 15 + 5 * (posits[0].bitstring.length - 2),
        n:n,
        es:es,
        dtheta:calculateDTheta(n),
    }

    var texts = container.selectAll('.negativeText').data(negativePosits)
    setBitstringTextAttrs(texts.enter().append('text'), params, 1, 'negativeText')
    setBitstringTextAttrs(texts, params, 1, 'negativeText')
    texts.exit().remove()

    texts = container.selectAll('.positiveText').data(positivePosits)
    setBitstringTextAttrs(texts.enter().append('text'), params, 0, 'positiveText')
    setBitstringTextAttrs(texts, params, 0, 'positiveText')
    texts.exit().remove()
}

function createLegend(container) {
    const color = d3.scaleOrdinal()
        .range([COLORS[0], COLORS[1], COLORS[2], COLORS[3]])
        .domain(["Sign","Regime","Exponent","Fraction"]);

    const legend = container
        .selectAll(".legend")
        .data(color.domain())
        .enter()
        .append('g')
        .attr("class", "legend")
        .attr("transform", function(d,i) {
            return `translate(0, ${i * 20})`;
        });

    legend.append('rect')
        .attr('class', 'legend-rect')
        .attr('x', width + margin.right-12)
        .attr('y', 65)
        .attr('width', 12)
        .attr('height', 12)
        .style('fill', color)

    legend.append("text")
        .attr('class', 'legend-text')
        .attr("x", width + margin.right-22)
        .attr("y", 70)
        .style('font-size', "12px")
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;});
}
function createTooltip(contianer, n, es) {
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
    container.call(tip);

    container.selectAll(".positiveDot")
        .on('mouseover', function(d) { tip.show(d, this);})
        .on('mouseout', function(d) { tip.hide();});
    container.selectAll(".negativeDot")
        .on('mouseover', function(d) { tip.show(d, this);})
        .on('mouseout', function(d) { tip.hide();});
    container.selectAll(".zeroDot")
        .on('mouseover', function(d) { tip.show(d, this);})
        .on('mouseout', function(d) { tip.hide();});
    container.selectAll(".infDot")
        .on('mouseover', function(d) { tip.show(d, this);})
        .on('mouseout', function(d) { tip.hide();});
}

function getDotCoordsFromPosit(x_center, y_center, radius, dtheta, sign, posit) {
    var posit_as_int = unsignedIntegerFromBitstring(posit.bitstring);
    var infVal = 2**(posit.bitstring.length - 1);
    var end_angle;
    if (sign === 0) {
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

/**
 * Draw the projective reals line on an SVG.
 * @param svgSelection - the d3 selection of the SVG element.
 */
function drawProjectiveRealsLine(container, width, height, n, es, format) {
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
    var defs = container.append('defs');
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

    drawPositivePath(container, x_center, y_center, radius, zero, arrowheadMarkerId)
    drawNegativePath(container, x_center, y_center, radius, zero, arrowheadMarkerId)

    drawPositiveDots(container, x_center, y_center, positivePosits, n, es)
    drawNegativeDots(container, x_center, y_center, negativePosits, n, es)

    if (displayFormat === label_format.FRACTION) {
        drawFractionLabels(container, width, height, n, es);
    }
    else {
        drawBitstringLabels(container, width, height, n, es);
    }

    drawZero(container, x_center, y_center, radius, zero, format)
    drawInfinityDot(container, x_center, y_center, radius, infinity, format)
}

function drawPositiveDots(container, x_center, y_center, posits, n, es) {
    var radius = calculateRadius(n)
    var dtheta = calculateDTheta(n)

    var dots = container.selectAll('.positiveDot').data(posits)
    dots.enter().append('circle')
        .attr('class', 'positiveDot')
        .attr('cx', (d) => getDotCoordsFromPosit(x_center, y_center, radius, dtheta, 0, d).x)
        .attr('cy', (d) => getDotCoordsFromPosit(x_center, y_center, radius, dtheta, 0, d).y)
        .attr('r', 5)
        .attr('fill', 'black');
    dots
        .attr('cx', (d) => getDotCoordsFromPosit(x_center, y_center, radius, dtheta, 0, d).x)
        .attr('cy', (d) => getDotCoordsFromPosit(x_center, y_center, radius, dtheta, 0, d).y)
    dots.exit().remove()
}

function drawNegativeDots(container, x_center, y_center, posits, n, es) {
    var radius = calculateRadius(n)
    var dtheta = calculateDTheta(n)

    var dots = container.selectAll('.negativeDot').data(posits)
    dots.enter().append('circle')
        .attr('class', 'negativeDot')
        .attr('cx', (d) => getDotCoordsFromPosit(x_center, y_center, radius, dtheta, 1, d).x)
        .attr('cy', (d) => getDotCoordsFromPosit(x_center, y_center, radius, dtheta, 1, d).y)
        .attr('r', 5)
        .attr('fill', 'black');
    dots
        .attr('cx', (d) => getDotCoordsFromPosit(x_center, y_center, radius, dtheta, 1, d).x)
        .attr('cy', (d) => getDotCoordsFromPosit(x_center, y_center, radius, dtheta, 1, d).y)
    dots.exit().remove()
}

function drawPositivePath(container, x_center, y_center, radius, zero, arrowheadMarkerId) {
    var positivePath = container.selectAll('.positivePositPath').data(zero);
    positivePath.enter().append('path')
        .attr('class', 'positivePositPath')
        .attr('d', describeArc(x_center, y_center, radius, 0, 180, 3))
        .attr('stroke-width', '3')
        .attr('stroke', 'orange')
        .attr('fill', 'none')
        .attr('marker-end', 'url(#' + arrowheadMarkerId + ')');
    positivePath
        .attr('d', describeArc(x_center, y_center, radius, 0, 180, 3))
    positivePath.exit().remove()

}

function drawNegativePath(container, x_center, y_center, radius, zero, arrowheadMarkerId) {
    // negative arc
    var negativePath = container.selectAll('.negativePositPath').data(zero);
    negativePath.enter().append('path')
        .attr('class', 'negativePositPath')
        .attr('d', describeArc(x_center, y_center, radius, 1, 180, 357))
        .attr('stroke-width', '3')
        .attr('stroke', 'blue')
        .attr('fill', 'none')
        .attr('marker-end', 'url(#' + arrowheadMarkerId + ')');
    negativePath
        .attr('d', describeArc(x_center, y_center, radius, 1, 180, 357))
    negativePath.exit().remove()

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
 * Create an arrowhead <marker> element to be appended to an <svg> (within a
 * <defs>).
 * See https://vanseodesign.com/web-design/svg-markers/.
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
 * Create a dot <marker> element to be appended to an <svg> (within a <defs>).
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
