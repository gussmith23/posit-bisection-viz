ifndef VIZ_INSTALL_DIR
$(error VIZ_INSTALL_DIR is not set)
endif

install: posit-bisection-viz.html
				cp posit-bisection-viz.html ${VIZ_INSTALL_DIR}
