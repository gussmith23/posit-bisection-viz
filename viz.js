/**
 * Update data with new posit parameters.
 *
 * Regenerates set of posits, splits them into positive, negative, zero, and
 * infinity; attaches new set of data to the viz.
 */
function update(n, es) {
    const posits = generatePositsOfLength(n, es);

    const positCompare = function(posit1, posit2) {
        return unsignedIntegerFromBitstring(posit1.bitstring) - unsignedIntegerFromBitstring(posit2.bitstring);
    };

    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
          .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
          .sort(positCompare);
    const zero = posits.filter(p => p.value === 0.0);
    const infinity = posits.filter(p => p.value === Infinity);
    console.assert(zero && infinity);
    console.assert(positivePosits.length === negativePosits.length);
    console.assert(positivePosits.length + negativePosits.length + 2 === 2**n);

    // Here, we need to use d3 to select markers along the number lines, and
    // assign the data to the markers.
    // I think we'll have a .positiveDot class for the dots on the positive
    // line, and a .negativeDot class for the dots on the negative line.
    // Then, we need to set the markers' position attributes based on the
    // posit's position in the sorted list.
}

/**
 * Draw the projective reals line on an SVG.
 * @param svgSelection - the d3 selection of the SVG element.
 */
function drawProjectiveRealsLine(svgSelection, width, height) {
    // An assumption I'm making right now.
    console.assert(width === height);

    // Create a defs block; define arrowhead and dot markers.
    var arrowheadMarker = createArrowheadMarker();
    var arrowheadMarkerId = d3.select(arrowheadMarker).attr('id');
    var dotMarker = createDotMarker();
    var dotMarkerId = d3.select(dotMarker).attr('id');

    // This weird syntax is what d3 expects:
    // https://stackoverflow.com/questions/23110366/d3-append-with-variable
    var defs = container.append('defs');
    defs.append(function () {return arrowheadMarker;});
    defs.append(function(){return dotMarker;});

    var fill = 'none';
    var stroke = 'black';
    var strokeWidth = '2';

    var origin = {x : width/2, y : height};
    var dest = {x : width/2, y : 0};
    var radius = (width)/2;
    container.append('path')
        .attr('d',
              'M' + origin.x + ' ' + origin.y + ' '
              + 'A' + radius + ' ' + radius + ' '
              + '0' + ' '
              + '0 0' + ' '
              + dest.x + ' ' + dest.y + ' ')
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('marker-end', 'url(#' + arrowheadMarkerId + ')')
        .attr('marker-mid', 'url(#' + dotMarkerId + ')');
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
