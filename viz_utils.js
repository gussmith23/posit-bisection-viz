/**
 * A file full of things that get used for several elements in the visualization
 * Also the "magic number" definitions
 */

const label_format = {
    FRACTION: 'fraction',
    BITSTRING: 'bitstring'
};

const scale_format = {
    LINEAR: 'linear',
    LOG: 'log'
};

const psign= {
    POSITIVE: 0,
    NEGATIVE: 1
};

const dot_opacity = {
    FOCUSED: 1.0,
    UNFOCUSED: 0.6
};

const dot_radius = {
    FOCUSED: 7,
    UNFOCUSED: 5
};

/**
 * @brief Calculate the radius of the posit circle
 * @param n is the current n used for decoding posits
 * @returns the size of the radius
 */
function calculateRadius(n) {
    // TODO(gus) magic numbers
    return ((n/2) * 100) + (2**(n/2) * 3);
}

/**
 * @brief Calculate the radius of the circle that the posit text goes around
 * This is the posit radius plus a constant factor
 * @param n is the current n used for decoding posits
 * @returns the size of the radius
 */
function calculateTextRadius(radius) {
    return radius + 20;
}

/**
 * @brief Calculate the Y-coordinate of the center of the posit circle 
 * @param n is the current n used for decoding posits
 * @returns the Y coordinate
 */
function calculateYCenter(n) {
    return calculateRadius(n) + (n * 5);
}

/**
 * @brief Calculate the angle spacing between points on the posit circle 
 * @param n is the current n used for decoding posits
 * @returns The angle difference to use
 * TODO return a list of angles instead, intervals based scaleFormat
 */
function calculateDTheta(n, posits) {
    var total_angle = 178; // How many degrees we have to play with
    var dthetas = [];
    var last_angle = 0;
    var angle;
    if (scaleFormat == scale_format.LINEAR) {
        for (i = 0; i < posits.length; i++) {
            // TODO(gus) magic numbers
            angle = total_angle/(1 << (n-1)) + last_angle;
            dthetas.push(angle);
            last_angle = angle;
        }
    } else {
        // var max_log_val = Math.max.apply(Math, posits.map(
        //     function(p) { return Math.log2(Math.abs(p.value));}));
        var max_log_val = Math.log2(Math.abs(posits[posits.length - 1].value));
        // var min_log_val = Math.min.apply(Math, posits.map(
        //     function(p) { return Math.log2(Math.abs(p.value));}));
        var min_log_val = Math.log2(Math.abs(posits[0].value));
        var log_val_range = max_log_val - min_log_val;
        for (i = 0; i < posits.length; i++) {
            var log_val = Math.log2(Math.abs(posits[i].value));
            var percent_of_range = (log_val - min_log_val) / log_val_range;
            angle = total_angle * percent_of_range;
            // dthethas.push(angle - last_angle);
            dthetas.push(0);
            last_angle = angle;
        }
    }
    return dthetas;
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

