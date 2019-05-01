
/**
 * Draw the projective reals line on an SVG.
 * @param svgSelection - the d3 selection of the SVG element.
 */
function drawProjectiveRealsLine(svgSelection, width, height) {
    // An assumption I'm making right now.
    console.assert(width === height);

    // Create a defs block; define arrowhead marker.
    var marker = createMarker();
    var markerId = d3.select(marker).attr('id');
    container.append('defs').append(function () {return marker;});

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
        .attr('marker-end', 'url(#' + markerId + ')');
}

/**
 * Create a <marker> element to be appended to an <svg> (within a <defs>).
 * See https://vanseodesign.com/web-design/svg-markers/.
 */
function createMarker() {
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

