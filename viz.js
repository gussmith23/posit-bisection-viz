
/**
 * Draw the projective reals line on an SVG.
 * @param svgSelection - the d3 selection of the SVG element.
 */
function drawProjectiveRealsLine(svgSelection) {
    var width = svgSelection.attr('width');
    var height = svgSelection.attr('height');
    var origin = {x : width/2, y : height};
    var dest = {x : width/2, y : 0};
    var radius = width/2;
    container.append('path')
        .attr('d',
              'M' + origin.x + ' ' + origin.y + ' '
              + 'A' + radius + ' ' + radius + ' '
              + '0' + ' '
              + '0 0' + ' '
              + dest.x + ' ' + dest.y + ' ')
        .attr('fill','none')
        .attr('stroke', 'black')
        .attr('stroke-width', '2');
}

