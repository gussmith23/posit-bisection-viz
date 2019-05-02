ifndef VIZ_INSTALL_DIR
$(error VIZ_INSTALL_DIR is not set)
endif

# TODO(gus) --parents might not be portable
install: posit-bisection-viz.html viz.js posit.js expect.js/index.js
				cp --parents $^ ${VIZ_INSTALL_DIR}
