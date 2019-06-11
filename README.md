# Well-Rounded: Visualizing Floating Point Representations

Final project for UW CSE 512, Data Visualization, taught by Jeffrey Heer.

Please see the project's [index.html](https://github.com/gussmith23/posit-bisection-viz/blob/master/index.html) for background. This page is hosted at [https://cse512-19s.github.io/FP-Well-Rounded/](https://cse512-19s.github.io/FP-Well-Rounded/).

## Work Split

| Team Member  | Responsibility                                                   |
|--------------|------------------------------------------------------------------|
| Neil Ryan    | Tooltips, dropdowns, other D3 work, paper writing, poster design |
| Katie Lim    | Brushing, histogram, other D3 work, paper writing, poster design |
| Gus Smith    | Posit library, poster design, paper writing, other D3 work       |
| Dan Petrisko | Float library, bfloat library, paper organization                |

## Development Process

When we began development on the original visualization in A3, we started with two primary sources of guidance:
1. John Gustafson's _Beating Floating Point_ paper, which contained the visualization which we sought to duplicate and make interactive, and
2. Bill Zorn, a member of the PLSE lab who works with numerical datatypes, and who was interested in visualizing specific attributes of the posit.

In A3, we were successfully able to duplicate and make interactive (using D3) Gustafson's original visualization. For the final project, we wanted to expand the visualization with new features not present in any prior posit visualizations. To do this, we had Bill review our A3 work and suggest interesting next steps. His main insights were
- showing rounding behavior would be interesting, and
- positioning posits on the circle based on their value, both in linear and log scales, would give a good sense of distribution.
With these ideas in mind, we moved forward to implement our final project.

We organized our development using the tools on GitHub. We opened issues for each feature to be implemented, and assigned them to group members as needed.

As development progressed, we added a number of our own features, such as
- a histogram over the posit values, perhaps one of the most interesting parts of the visualization, and
- a brush to enable zooming in on specific parts of the number line.
