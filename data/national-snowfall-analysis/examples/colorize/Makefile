
C0 = \#fff
C1 = \#04355d

tif/color.tif:
	mkdir -p $(dir $@)
	cp ../../snow-accumulation/season/2017-12-21--12.tif tif/grayscale.tif
	node colorize-geotiff.js \
		-c '$(C0):$(C1)' \
		-d 0: \
		-i tif/grayscale.tif \
		-o tif/color.tif
