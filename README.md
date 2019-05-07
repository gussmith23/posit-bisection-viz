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
 2. The addition of the _regime_ bitfield.

IEEE floating point numbers have only one parameter, `n`, which describes their length (generally 32 or 64). In addition to `n`, posits have another parameter `es`. `es` determines two things:
 - The maximum length of the exponent field, and
 - The value of a constant `useed` that is used in calculating the value of the posit, where `useed` is `2^2^es`.
 
The _regime_ bitfield is a varying-length, unary-encoded field which comes just after the posit's sign field. The field is encoded as a number of 0s ending with a 1, or a number of 1s ending with a 0: `001` or `1110`, for example. The number of 1s or 0s translates to the sign and value of `k`, a number used to calculate the value of the posit.

The final posit is calculated as `sign * useed^k * 2^exponent * 1.fraction`.

## Visualizing Posits

In this project, we decided to make an interactive version of the visualization shown on page 2 of [John Gustafson's original posit paper](http://www.johngustafson.net/pdfs/BeatingFloatingPoint.pdf) and page 16 of [Peter Lindstrom's CoNGA 2019 slides.](https://posithub.org/conga/2019/docs/13/1000-PeterLindstrom.pdf) This visualization shows the posits laid out on the _projectively-extended real number line_, which is the real number line we are used to, but with both infinities being represented by the same point. This makes sense for posits, as posits only have one representation for infinity. The process of filling out the values on this circle is often called _posit bisection_: we first bisect the points between infinity and 0 (which gives us 1 and -1), and then we continue bisecting between those points until we use all `n` bits.

### Design Decisions

The primary interaction method we were interested in was the varying of the `n` and `es` parameters. We wanted to show how the space of posits expanded as `n` increased, and how the dynamic range of the posits changed with changes in `es`. Thus, we built up the basic structure of this visualization: the circle representing the number line, and two sliders to control `n` and `es`. Sliders, while being a rather rudimentary interaction technique, were the most straightforward method of achieving the interaction we wanted. Additionally, users may be interested in viewing either the bitstring representation or the fractional value of the posit. We provide buttons which allow users to toggle between these two modes.

When choosing the bounds for our `n` and `es` sliders, we were primarily limited by the amount of space on the page. As `n` increased, we decided to increase the size of the circle to accommodate the larger quantity of numbers appearing on the circle. However, at a certain point, the circle became unreasonably cluttered anyway; this gave us a practical upper limit on `n`. On the other hand, the `es` parameter does not effect the quantity of numbers appearing on the circle. We simply chose a reasonable, useful range for `es` that was fairly similar to the range for `n**.

We decided to add an additional layer of interactivity via tooltips which appear as you hover over individual numbers.

There were additionally a number of non-interactivity design decisions to be made. Color coding of the bitfields within the posits was an improvement lifted from previous posit representations; both Gustafson's and Lindstrom's works bring life to the otherwise uninterpretable bitstring by color-coding the fields.

## Development Process

Development of our visualization proceeded roughly as follows: first, Gus wrote up a small posit library in Javascript, as he was the group member most familiar with the format. The library hid most of the complexity of posits that were unnecessary to the visualization goal. Additionally, he built a very basic example of the number line as a proof-of-concept. Next, as a group, we added bugs to the GitHub repository representing distinct subgoals and improvements which would bring us to our finished product. After that point, development continued mostly individually; keeping the code modular helped us with this separation.

We estimate that we spent roughly 40 people-hours on this project. We found that writing d3 was unsurprisingly challenging, and that it took us even longer to get to the baseline visualization than we originally expected. In addition, there was much time lost due to the introduction of bugs later in the process; we find that JavaScript can be an unforgiving language, and we weren't familiar with how to test for regressions in visualizations. While we are happy with our finished project, we also have a laundry list of interesting additions that we did not get to explore given time constraints.

## Future Improvements

We are considering improving upon this visualization in our final project. There are a number of very interesting additions which we did not get to explore in this project.

 1. __Interactively interpolating new numbers.__ _Bisection_ is the process of, given an additional bit to use, interpolating a new number between two existing numbers on the line. Interpolation in posits is done in a number of ways; this baseline visualization would lend itself well to explaining these interpolation methods, through simple animations.
 2. __Building a similar visualization for other datatypes.__ IEEE floating points, for example, could be displayed on a normal number line, or in some other way compared to posits. We could, for example, wrap the normal number line around the posit number line, and line the values up point-for-point.
 3. __Zooming in on areas of a cluttered number line.__ As `n` gets larger, the number line gets very cluttered. Hovering over a segment of the circle could "zoom" in to those numbers, spreading them out (and squashing the rest of the numbers closer together).
