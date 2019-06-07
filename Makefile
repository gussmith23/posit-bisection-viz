ifndef VIZ_INSTALL_DIR
$(error VIZ_INSTALL_DIR is not set)
endif

# TODO(gus) --parents might not be portable
install: index.html viz.js posit.js expect.js/index.js d3tip.js brush.js d3.svg.circularbrush.js viz_utils.js cse512.css float16.js favicon.ico histogram.js
				cp --parents $^ ${VIZ_INSTALL_DIR}
