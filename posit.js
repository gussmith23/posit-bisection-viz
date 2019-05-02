/**
 * Small posit library.
 *
 * We represent bitstrings as arrays of 0s and 1s.
 * We represent posit bitfields as:
 * var positBitfields = {
 *     sign : [],
 *     regime : [],
 *     exponent : [],
 *     fraction : []
 * };
 * where each bitfield is a bitstring.
 */

function positBitfieldsFromBitstring(bitstring, n, es) {
    console.assert(bitstring.length === n);
    for (i in bitstring) console.assert(bitstring[i] === 0 || bitstring[i] === 1);
    console.assert(n >= 0);
    console.assert(es >= 0);

    var positBitfields = {
        sign : [],
        regime : [],
        exponent : [],
        fraction : []
    };

    var idx = 0;

    if (idx >= n) return positBitfields;

    positBitfields.sign = [ bitstring[idx] ];
    ++idx;

    if (idx >= n) return positBitfields;

    // Get the first regime bit
    var firstRegimeBit = bitstring[idx];
    positBitfields.regime.push(firstRegimeBit);
    ++idx;

    // Get the rest of the regime bits
    while (idx < n && bitstring[idx] === firstRegimeBit) {
        positBitfields.regime.push(bitstring[idx]);
        ++idx;
    }

    if (idx >= n) return positBitfields;

    // Get the last regime bit
    positBitfields.regime.push(bitstring[idx]);
    ++idx;

    // Get the exponent
    positBitfields.exponent = bitstring.slice(idx, idx+es);
    idx += es;

    if (idx >= n) return positBitfields;

    // Get the fraction
    positBitfields.fraction = bitstring.slice(idx, n);

    return positBitfields;
}

expect(
    positBitfieldsFromBitstring([0,0,0,0,1,1,0,1,1,1,0,1,1,1,0,1], 16, 3))
    .to.eql({
        sign : [0],
        regime : [0,0,0,1],
        exponent : [1,0,1],
        fraction : [1,1,0,1,1,1,0,1]
    });
