
/**
 * Draw the projective reals line on an SVG.
 * @param svgSelection - the d3 selection of the SVG element.
 */
function drawProjectiveRealsLine(svgSelection, width, height) {
    // An assumption I'm making right now.
    console.assert(width === height);

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
        .attr('stroke-width', strokeWidth);
}

