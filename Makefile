ifndef VIZ_INSTALL_DIR
$(error VIZ_INSTALL_DIR is not set)
endif

install: posit-bisection-viz.html viz.js
				cp $^ ${VIZ_INSTALL_DIR}
