

function decodebfloat16(bitstring) {
    var out = {
        'bitstring' : bitstring,
        'value' : undefined,
        'pzero' : false,
        'nzero' : false,
        'pnan' : false,
        'nnan' : false,
        'pinfinity' : false,
        'ninfinity' : false
    };

    var sgnbits = bitstring[0]
    var expbits = bitstring.slice(1,9).join("")
    var subbits = bitstring.slice(1,9).join("")
    var frabits = bitstring.slice(9, 16).join("")

    var sgn = parseInt(sgnbits);
    var exp = parseInt(expbits, 2) - 127
    var sub = (parseInt(subbits, 2) == 0)
    var fra = (1.0-sub) + parseInt(frabits, 2) / 2**7

    var value = 2**exp * fra; 
    if (sgn == 1) {
        value = -value;
    }

    var pzero = bitstring.join("") == "0_00000000_0000000";
    var nzero = bitstring.join("") == "1_00000000_0000000";
    var pinf = bitstring.join("") == "0_11111111_0000000";
    var ninf = bitstring.join("") == "1_11111111_0000000";
    var pnan = (bitstring.slice(0, 9).join("") == "0_11111111") & !pinf;
    var nnan = (bitstring.slice(0, 9).join("") == "1_11111111") & !ninf;

    out.bitstring = bitstring;
    out.value = value;
    out.pzero = pzero;
    out.nzero = nzero;
    out.pinfinity = pinf;
    out.ninfinity = ninf;
    out.pnan = pnan;
    out.nnan = nnan;

    //console.log(
    //    "sign: " + sgn + ": " + sgnbits
    //    + " exp: " + exp + ": " + expbits
    //    + " sub: " + sub + ": " + subbits
    //    + " fra: " + fra + ": " + frabits
    //    + " val: " + value.toFixed(2) + ": " + bitstring
    //    );

    return out
}

//console.log(decodefloat16([0, 1,0,0,1,0,1,0,0, 1,1,0,0,0,1,1]))

function decodefloat16(bitstring) {
    var out = {
        'bitstring' : bitstring,
        'value' : undefined,
        'pzero' : false,
        'nzero' : false,
        'pnan' : false,
        'nnan' : false,
        'pinfinity' : false,
        'ninfinity' : false
    };

    var sgnbits = bitstring[0]
    var expbits = bitstring.slice(1,6).join("")
    var subbits = bitstring.slice(1,6).join("")
    var frabits = bitstring.slice(6, 16).join("")

    var sgn = parseInt(sgnbits, 2);
    var exp = parseInt(expbits, 2) - 15
    var sub = (parseInt(subbits, 2) == 0) 
    var fra = (1.0-sub) + parseInt(frabits, 2) / 2**10

    var value = 2**exp * fra; 
    if (sgn == 1) {
        value = -value;
    }

    var pzero = bitstring.join("") == "0_00000_0000000000";
    var nzero = bitstring.join("") == "1_00000_0000000000";
    var pinf = bitstring.join("") == "0_11111_1111111111";
    var ninf = bitstring.join("") == "1_11111_1111111111";
    var pnan = (bitstring.slice(0, 6).join("") == "0_11111") & !pinf;
    var nnan = (bitstring.slice(0, 6).join("") == "1_11111") & !ninf;

    out.bitstring = bitstring;
    out.value = value;
    out.pzero = pzero;
    out.nzero = nzero;
    out.pinfinity = pinf;
    out.ninfinity = ninf;
    out.pnan = pnan;
    out.nnan = nnan;

    //console.log(
    //    "sign: " + sgn + ": " + sgnbits
    //    + " exp: " + exp + ": " + expbits
    //    + " sub: " + sub + ": " + subbits
    //    + " fra: " + fra + ": " + frabits
    //    + " val: " + value.toFixed(2) + ": " + bitstring
    //    );

    return out
}

//console.log(decodefloat16([0, 1,0,0,1,0, 1,0,0,1,1,0,0,0,1,1]))

function bFloatCompare(bfloat1, bfloat2) {
    return bfloat1.value - bfloat2.value;
};

function generateBFloats() {
    var arr = new Array(2**16);
    for (var i = 0; i < arr.length; i++) {
        var bitstring = i.toString(2).padStart(16, '0').split('');
        var bitarray = bitstring.map(bit => parseInt(bit));
        arr[i] = decodebfloat16(bitarray);
    }

    const positiveBfloat = arr.filter(bfloat => bfloat.value > 0).sort(bFloatCompare);
    const negativeBfloat = arr.filter(bfloat => bfloat.value < 0).sort(bFloatCompare);
    // Order the negative posits by closeness to zero, since that matches
    // the order that we draw them
    negativeBfloat.reverse();
    const zeroBfloat = arr.filter(p => p.pzero || p.nzero);
    const infinity = arr.filter(p => p.pinfinity || p.ninfinity);
    console.assert(zeroBfloat && infinity);
    console.assert(positiveBfloat.length === negativeBfloat.length);
    // NANs mess this up
    //console.assert(negativeBfloat.length + negativeBfloat.length + 2 === 2**16);

    return {
        pos: positiveBfloat,
        neg: negativeBfloat,
        zero: zeroBfloat,
        inf: infinity
    }
}

function floatCompare(float1, float2) {
    return float1.value - float2.value;
};

function generateFloats() {
    var arr = new Array(2**16);
    for (var i = 0; i < arr.length; i++) {
        var bitstring = i.toString(2).padStart(16, '0').split('');
        var bitarray = bitstring.map(bit => parseInt(bit));
        arr[i] = decodefloat16(bitarray);
    }

    const positiveFloat = arr.filter(float => float.value > 0).sort(floatCompare);
    const negativeFloat = arr.filter(float => float.value < 0).sort(floatCompare);
    // Order the negative posits by closeness to zero, since that matches
    // the order that we draw them
    negativeFloat.reverse();
    const zeroFloat = arr.filter(p => p.pzero || p.nzero);
    const infinity = arr.filter(p => p.pinfinity || p.ninfinity);
    console.assert(zeroFloat && infinity);
    console.assert(positiveFloat.length === negativeFloat.length);
    // NANs mess this up
    //console.assert(negativeFloat.length + negativeFloat.length + 2 === 2**16);

    return {
        pos: positiveFloat,
        neg: negativeFloat,
        zero: zeroFloat,
        inf: infinity
    }
}

generateFloats()
generateBFloats()