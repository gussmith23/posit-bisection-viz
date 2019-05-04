/**
 * Update data with new posit parameters.
 *
 * Regenerates set of posits, splits them into positive, negative, zero, and
 * infinity; attaches new set of data to the viz.
 */
function update(contianer, width, height, n, es) {
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
    drawProjectiveRealsLine(container, width, height, n, es);


    // Here, we need to use d3 to select markers along the number lines, and
    // assign the data to the markers.
    // I think we'll have a .positiveDot class for the dots on the positive
    // line, and a .negativeDot class for the dots on the negative line.
    // Then, we need to set the markers' position attributes based on the
    // posit's position in the sorted list.
}

function setAttrs(nodes, sign, width, dtheta, markerId) {
    var height = width;
    var fill = 'none';
    var stroke = 'black';
    var strokeWidth = '2';
    var radius = width / 2;
    if (sign) {
        nodes
            .attr('d', (d) => generateArcFromPosit(width/2, height/2, radius,
                dtheta, sign, d))
            .attr('class', 'negativePositPath')
            .attr('fill', fill)
            .attr('stroke', stroke)
            .attr('stroke-width', strokeWidth)
            .attr('marker-end', 'url(#' + markerId + ')');
    } else {
        nodes
            .attr('d', (d) => generateArcFromPosit(width/2, height/2, radius,
                dtheta, sign, d))
            .attr('class', 'positivePositPath')
            .attr('fill', fill)
            .attr('stroke', stroke)
            .attr('stroke-width', strokeWidth)
            .attr('marker-end', 'url(#' + markerId + ')');
    }
}

function drawLabels(container, width, height, dtheta, posits, sign) {
    radius = width/2 + 30
    var texts;
    if (sign) {
        texts = container.selectAll('.negativeDot').data(posits)
        texts
            .enter().append('text')
            .attr('x', (d) => getDotCoordsFromPosit(width/2, height/2,
                radius, dtheta, sign, d).x)
            .attr('y', (d) => getDotCoordsFromPosit(width/2, height/2,
                radius, dtheta, sign, d).y)
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', 'middle')
            .attr('class', 'negativeDot')
            .text((d) => d.bitstring.join(""));
    } else {
        texts = container.selectAll('.positiveDot').data(posits)
        texts
            .enter().append('text')
            .attr('x', (d) => getDotCoordsFromPosit(width/2, height/2,
                radius, dtheta, sign, d).x)
            .attr('y', (d) => getDotCoordsFromPosit(width/2, height/2,
                radius, dtheta, sign, d).y)
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', 'middle')
            .attr('class', 'positiveDot')
            .text((d) => d.bitstring.join(""));
    }
    texts.exit().remove()
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
        if (posit.value != Infinity) { posit_as_int -= infVal;}
        end_angle = 180 + (dtheta * (posit_as_int))
    }
    return polarToCartesian(x_center, y_center, radius, end_angle);
}

/**
 * Draw the projective reals line on an SVG.
 * @param svgSelection - the d3 selection of the SVG element.
 */
function drawProjectiveRealsLine(container, width, height, n, es) {
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

    var dtheta = 180/(1 << (n-1));

    var positivePaths = container.selectAll('.positivePositPath')
        .data(positivePosits);
    setAttrs(positivePaths, 0, width, dtheta, dotMarkerId);
    setAttrs(positivePaths.enter().append('path'), 0, width, dtheta, dotMarkerId);
    // add the last arc with an arrowhead
    var posFinalArc = container.append('path').data(infinity)
    setAttrs(posFinalArc, 0, width, dtheta, arrowheadMarkerId);

    var negativePaths = container.selectAll('.negativePositPath')
        .data(negativePosits);
    setAttrs(negativePaths, 1, width, dtheta, dotMarkerId);
    setAttrs(negativePaths.enter().append('path'), 1, width, dtheta, dotMarkerId);
    negativePaths.exit().remove();
    // Add the final arc with an arrowhead
    var negFinalArc = container.append('path').data(infinity)
    setAttrs(negFinalArc, 1, width, dtheta, arrowheadMarkerId);
    drawLabels(container, width, height, dtheta, positivePosits, 0);
    drawLabels(container, width, height, dtheta, negativePosits, 1);
}

function generateArcFromPosit(x_center, y_center, radius, dtheta, sign, posit) {
    var posit_as_int, start_angle, end_angle;
    // draw arcs in the positive direction
    var posit_as_int = unsignedIntegerFromBitstring(posit.bitstring);
    var infVal = 2**(posit.bitstring.length - 1);
    if (sign === 0) {
        start_angle = 180 - (dtheta * (posit_as_int - 1))
        end_angle = 180 - (dtheta * posit_as_int)
    } else {
        // Semi-hacky correction so that negative posits go
        // from most negative to least negative
        if (posit.value != Infinity) { posit_as_int -= infVal;}
        start_angle = 180 + (dtheta * (posit_as_int - 1))
        end_angle = 180 + (dtheta * (posit_as_int))
    }
    return describeArc(x_center, y_center, radius, sign, start_angle, end_angle)
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
    var refX = '0';
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
