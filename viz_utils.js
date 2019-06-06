/**
 * A file full of things that get used for several elements in the visualization
 * Also the "magic number" definitions
 */

const label_format = {
    FRACTION: 'fraction',
    BITSTRING: 'bitstring'
};

const scale_format = {
    ORDINAL: 'ordinal',
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

const path_gap = {
    DEGREES: 3,
    RADIANS: 3 * (Math.PI/180)
}

const dot_total_angle = {
    DEGREES: 170
}

/**
 * @brief Calculate the radius of the posit circle
 * @param n is the current n used for decoding posits
 * @returns the size of the radius
 */
function calculateRadius(n) {
    // TODO(gus) magic numbers
    return ((6/2) * 100) + (2**(6/2) * 3);
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
    return calculateRadius(6) + (6 * 5) + 100;
}

/**
 * @brief Calculate the angle difference between the placement of a point
 *        and the bottom of the circle.
 * @param n is the current n used for decoding posits
 * @param posits A list of positive or negative posits that correspond to n
 * @returns A list of absolute angles
 * TODO return a list of angles instead, intervals based scaleFormat
 */
function calculateDTheta(n, posits) {
    var total_angle = dot_total_angle.DEGREES; // How many degrees we have to play with
    var dthetas = [];
    var angle, max_val, min_val, val_range, val, percent_of_range;
    var num_posits = 1 << n;
    if (scaleFormat == scale_format.ORDINAL) {
        var last_angle = 0;
        for (i = 0; i < posits.length; i++) {
            angle = total_angle/(num_posits/2) + last_angle;
            dthetas.push(angle);
            last_angle = angle;
        }
    } else if (scaleFormat == scale_format.LINEAR) {
        max_val = Math.abs(posits[posits.length - 1].value);
        min_val = Math.abs(posits[0].value);
        val_range = max_val - min_val;
        for (i = 0; i < posits.length; i++) {
            val = Math.abs(posits[i].value);
            percent_of_range = (val - min_val) / val_range;
            angle = total_angle * percent_of_range;
            dthetas.push(angle);
        }
    } else { // Log scale format
        max_val = Math.log2(Math.abs(posits[posits.length - 1].value));
        min_val = Math.log2(Math.abs(posits[0].value));
        val_range = max_val - min_val;
        for (i = 0; i < posits.length; i++) {
            val = Math.log2(Math.abs(posits[i].value));
            percent_of_range = (val - min_val) / val_range;
            angle = total_angle * percent_of_range;
            dthetas.push(angle);
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

