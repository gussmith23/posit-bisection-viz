# Posit Bisection Visualization

Assignment 3 project for UW CSE 512, Data Visualization, taught by Jeffrey Heer.

## Background

Within the hardware of computers, representing numbers is a non-trivial problem. Positive, finite integers are fairly straightforward, as they can simply be encoded in binary. Negative integers add a layer of complication to encoding. Yet, compared to representing _real_ numbers, representing integers is straightforward. The representation of real numbers adds a significant layer of complexity due to the massive range of fractional numbers we might want to support, all of which must be encoded into a finite string of bits, generally 8, 16, 32, or 64 bits long.

The [IEEE 754 floating-point standard](https://en.wikipedia.org/wiki/IEEE_754) has been the de-facto standard for hardware implementations of floating-point numbers for over 30 years. IEEE 754 splits up 32 or 64 bits into bitfields:
 - A _sign_, indicating whether the datatype is positive or negative,
 - An _exponent_, encoding the order of magnitude of the number, and
 - A _fraction_, encoding the bits after the decimal point.
The resulting number is then calculated (roughly) as `sign * 2^exponent * 1.fraction`. This format has worked quite well in the general case, and is able to encode a large range of numbers. However, with the rise of machine learning and other compute-intensive, acceleration-amenable workloads, researchers have been exploring new numerical datatype formats with desirable properties in specific domains.

[_Posits_](http://www.johngustafson.net/pdfs/BeatingFloatingPoint.pdf) are just one example of a new numerical datatype developed to compete with the standard IEEE format, and are the datatype we focus on in this project. Posits add a number of very interesting features over IEEE floating point, but the most interesting at a high level are
 1. The addition of the `es` parameter, and
 2. The addition of the "regime" bitfield.
IEEE floating point numbers have only one parameter, `n`, which describes their length (generally 32 or 64). In addition to `n`, posits have another parameter `es`. `es` determines two things:
 - The maximum length of the exponent field, and
 - The value of a constant `k` that is used in calculating the value of the posit, where `k` is `2^2^es`.

[Peter Lindstrom's CoNGA 2019 slides.](https://posithub.org/conga/2019/docs/13/1000-PeterLindstrom.pdf) The projectively-extended real number line (circle) shown on page 16 is the core visualization which we will reproduce.

Also on page 2 (Figure 1) of the following link.
http://www.johngustafson.net/pdfs/BeatingFloatingPoint.pdf
