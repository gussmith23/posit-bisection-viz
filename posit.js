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

/**
 * Decode any posit (passed as a bitstring).
 */
function decodePosit(bitstring, n, es) {

    var out = {
        'bitstring' : bitstring,
        'rawBitfields' : undefined,
        'actualValueBitfields' : undefined,
        'value' : undefined
    };


    // Not sure if n<2 is meaningful.
    console.assert(n >= 2);
    console.assert(es >= 0);

    if (unsignedIntegerFromBitstring(bitstring) === 0) {
        out.value = 0.0;
        return out;
    }
    if (unsignedIntegerFromBitstring(bitstring) === 2**(bitstring.length-1)) {
        out.value = Infinity;
        return out;
    }

    // Raw bitfields: if the number is negative (i.e. first bit is 1), these are
    // the bitfields pre-twos-complement.
    var rawBitfields = positBitfieldsFromBitstring(bitstring, n, es);

    // If the sign is 1 (negative), the rest of the bitstring needs to be
    // twos-complemented.
    // These are the "actual value" bitfields; their values can be obtained by
    // converting the unsigned binary to decimal.
    var actualValueBitfields;
    if (rawBitfields.sign[0] === 1) {
        actualValueBitfields = positBitfieldsFromBitstring(
            bitstring.slice(0,1).concat(bitstringTwosComplement(bitstring.slice(1))), n, es);
    } else {
        actualValueBitfields = rawBitfields;
    }
    // Reset the sign bit to the correct (unflipped) value.
    actualValueBitfields.sign = rawBitfields.sign;

    var sign = (actualValueBitfields.sign[0] === 0 ? 1.0 : -1.0);
    var useed = useedFromEs(es);
    var k = kFromRegimeBitstring(actualValueBitfields.regime);
    var exponent = valueFromExponentBitstring(actualValueBitfields.exponent);
    var fraction = valueFromFractionBitstring(actualValueBitfields.fraction);
    var value = sign * useed**k * 2**exponent * fraction;

    out.rawBitfields = rawBitfields;
    out.actualValueBitfields = actualValueBitfields;
    out.value = value;

    return out;
};

expect(decodePosit([0,0,0,0], 4, 3).value).to.be(0.0);
expect(decodePosit([1,0,0,0], 4, 3).value).to.be(Infinity);
expect(decodePosit([0,1,1,1,0,0,1,0,1,0,0,0,0,0,0,0], 16, 0).value).to.be(5.25);
expect(decodePosit([0,1,1,0,0,0,1,0,1,0,0,0,0,0,0,0], 16, 1).value).to.be(5.25);
expect(decodePosit([0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0], 16, 2).value).to.be(5.25);
expect(decodePosit([0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,0], 16, 3).value).to.be(5.25);
expect(decodePosit([0,1,0,0,0,1,0,0,1,0,1,0,0,0,0,0], 16, 4).value).to.be(5.25);
expect(decodePosit([1,1,1,1,1,0,1,1,1,1,0,0,1,1,1,0], 16, 0).value).to.be(-0.0655517578125);
expect(decodePosit([1,1,1,0,1,1,1,1,1,0,0,1,1,1,0,0], 16, 1).value).to.be(-0.0655517578125);
expect(decodePosit([1,1,0,1,1,1,1,1,1,0,0,1,1,1,0,0], 16, 2).value).to.be(-0.0655517578125);
expect(decodePosit([1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,0], 16, 3).value).to.be(-0.0655517578125);
expect(decodePosit([1,1,0,0,0,1,1,1,1,1,1,0,0,1,1,1], 16, 4).value).to.be(-0.0655517578125);

function valueFromFractionBitstring(fraction) {
    if (fraction.length === 0) return 1.0;
    var val = unsignedIntegerFromBitstring(fraction);
    return 1.0 + val*2**(-1*fraction.length)
}

expect(valueFromFractionBitstring([1,1])).to.be(1.75);

/**
 * Interpret exponent bitstring as unsigned integer.
 */
function valueFromExponentBitstring(exponent) {
    if (exponent.length === 0) return 0;
    return unsignedIntegerFromBitstring(exponent);
}

expect(valueFromExponentBitstring([1,0,1])).to.be(5);

function unsignedIntegerFromBitstring(bitstring) {
    return parseInt(bitstring.map(bit => bit.toString()).join(''), 2);
}

/**
 * See table 1 in John Gustafson's "Beating Floating Point..."
 */
function kFromRegimeBitstring(regime) {
    // An assumption we're making for now. Not sure about zero-length regimes.
    console.assert(regime.length > 0);

    // m = number of identical bits in the run
    var m = 1;
    var i;
    for (i = 1; i < regime.length && regime[i] === regime[0]; i++) m++;

    return (regime[0] === 0 ? -1*m : m-1);
}

expect(kFromRegimeBitstring([0,0,0,0])).to.be(-4);
expect(kFromRegimeBitstring([0,0,0,1])).to.be(-3);
expect(kFromRegimeBitstring([0,0,1,0])).to.be(-2);
expect(kFromRegimeBitstring([0,0,1,1])).to.be(-2);
expect(kFromRegimeBitstring([0,1,0,0])).to.be(-1);
expect(kFromRegimeBitstring([0,1,0,1])).to.be(-1);
expect(kFromRegimeBitstring([0,1,1,0])).to.be(-1);
expect(kFromRegimeBitstring([0,1,1,1])).to.be(-1);
expect(kFromRegimeBitstring([1,0])).to.be(0);
expect(kFromRegimeBitstring([1,1,0])).to.be(1);
expect(kFromRegimeBitstring([1,1,1,0])).to.be(2);
expect(kFromRegimeBitstring([1,1,1,1])).to.be(3);

function useedFromEs(es) {
    console.assert(es >= 0);
    return 2**(2**es);
}

expect(useedFromEs(0)).to.be(2);
expect(useedFromEs(1)).to.be(4);
expect(useedFromEs(2)).to.be(16);
expect(useedFromEs(3)).to.be(256);
expect(useedFromEs(4)).to.be(65536);

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
expect(positBitfieldsFromBitstring([0,1,1,1,0,0,1,0,1,0,0,0,0,0,0,0], 16, 0))
    .to.eql({
        sign : [0],
        regime : [1,1,1,0],
        exponent : [],
        fraction : [0,1,0,1,0,0,0,0,0,0,0]
    });
expect(positBitfieldsFromBitstring([0,1,1,0,0,0,1,0,1,0,0,0,0,0,0,0], 16, 1))
    .to.eql({
        sign : [0],
        regime : [1,1,0],
        exponent : [0],
        fraction : [0,1,0,1,0,0,0,0,0,0,0]
    });

function bitstringTwosComplement(bitstring) {
    var val = unsignedIntegerFromBitstring(bitstring);
    // 0 is the twos-complement of itself
    if (val === 0) return bitstring;
    var n = bitstring.length;
    var twosComplement = 2**n - val;
    var asString = twosComplement.toString(2);
    asString = asString.padStart(bitstring.length, '0');
    var out = [];
    var i;
    for (i = 0; i < asString.length; i++) out.push(parseInt(asString[i]));
    console.assert(out.length === bitstring.length);
    return out;
}

expect(bitstringTwosComplement([0,1,1,0,1,0])).to.eql([1,0,0,1,1,0]);
expect(bitstringTwosComplement([1,0,0,0,0,0])).to.eql([1,0,0,0,0,0]);
expect(bitstringTwosComplement([0,0,0,0,0,1])).to.eql([1,1,1,1,1,1]);
expect(bitstringTwosComplement([0])).to.eql([0]);
