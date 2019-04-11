SHELL := /bin/bash

GENERATED_FILES := \
	tif/wi-snow-2013-11.tif \
	tif/wi-snow-2013-12.tif \
	tif/wi-snow-2014-01.tif \
	tif/wi-snow-2014-02.tif \
	tif/wi-snow-2014-03.tif \
	tif/wi-snow-2014-04.tif \
	tif/wi-snow-2014-11.tif \
	tif/wi-snow-2014-12.tif \
	tif/wi-snow-2015-01.tif \
	tif/wi-snow-2015-02.tif \
	tif/wi-snow-2015-03.tif \
	tif/wi-snow-2015-04.tif \
	tif/wi-snow-2015-11.tif \
	tif/wi-snow-2015-12.tif \
	tif/wi-snow-2016-01.tif \
	tif/wi-snow-2016-02.tif \
	tif/wi-snow-2016-03.tif \
	tif/wi-snow-2016-04.tif \
	tif/wi-snow-2016-11.tif \
	tif/wi-snow-2016-12.tif \
	tif/wi-snow-2017-01.tif \
	tif/wi-snow-2017-02.tif \
	tif/wi-snow-2017-03.tif \
	tif/wi-snow-2017-04.tif \
	tif/wi-snow-2017-11.tif \
	tif/wi-snow-2017-12.tif \
	tif/wi-snow-2018-01.tif \
	tif/wi-snow-2018-02.tif \
	tif/wi-snow-2018-03.tif \
	tif/wi-snow-2018-04.tif \
	tif/wi-snow-2018-11.tif \
	tif/wi-snow-2018-12.tif \
	tif/wi-snow-2019-01.tif \
	tif/wi-snow-2019-02.tif \
	tif/wi-snow-2019-03.tif \
	png/wi-snow-colored-2013-11.png \
	png/wi-snow-colored-2013-12.png \
	png/wi-snow-colored-2014-01.png \
	png/wi-snow-colored-2014-02.png \
	png/wi-snow-colored-2014-03.png \
	png/wi-snow-colored-2014-04.png \
	png/wi-snow-colored-2014-11.png \
	png/wi-snow-colored-2014-12.png \
	png/wi-snow-colored-2015-01.png \
	png/wi-snow-colored-2015-02.png \
	png/wi-snow-colored-2015-03.png \
	png/wi-snow-colored-2015-04.png \
	png/wi-snow-colored-2015-11.png \
	png/wi-snow-colored-2015-12.png \
	png/wi-snow-colored-2016-01.png \
	png/wi-snow-colored-2016-02.png \
	png/wi-snow-colored-2016-03.png \
	png/wi-snow-colored-2016-04.png \
	png/wi-snow-colored-2016-11.png \
	png/wi-snow-colored-2016-12.png \
	png/wi-snow-colored-2017-01.png \
	png/wi-snow-colored-2017-02.png \
	png/wi-snow-colored-2017-03.png \
	png/wi-snow-colored-2017-04.png \
	png/wi-snow-colored-2017-11.png \
	png/wi-snow-colored-2017-12.png \
	png/wi-snow-colored-2018-01.png \
	png/wi-snow-colored-2018-02.png \
	png/wi-snow-colored-2018-03.png \
	png/wi-snow-colored-2018-04.png \
	png/wi-snow-colored-2018-11.png \
	png/wi-snow-colored-2018-12.png \
	png/wi-snow-colored-2019-01.png \
	png/wi-snow-colored-2019-02.png \
	png/wi-snow-colored-2019-03.png


NEW_TIF := tif/wi-snow-2019-04.tif
NEW_PNG := png/wi-snow-colored-2019-04.png
NEW_FILES := $(NEW_TIF) $(NEW_PNG)

START_DATE := $(shell date '+%Y-%m')-01
END_DATE := $(shell date -d '1 day ago' '+%Y-%m-%d')

update: clean build upload cache-bust

clean:
	rm -f $(NEW_FILES)

build:
	. /code/snow/venv/bin/activate; $(MAKE) $(NEW_FILES) $(GENERATED_FILES)

upload:
	aws s3 cp --recursive png/ s3://projects.jsonline.com/apps/snow/static/monthly-maps/

cache-bust:
	aws cloudfront create-invalidation --distribution-id E3H0OA9T40SSTC --paths /apps/snow/static/monthly-maps/$(notdir $(NEW_PNG))

zip/states.zip:
	mkdir -p $(dir $@)
	curl -Lk -o $@.download 'https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_1_states_provinces_lakes.zip'
	mv $@.download $@

geojson/states.json: zip/states.zip
	mkdir -p $(dir $@) tmp
	unzip -d tmp $<
	mapshaper \
		-i tmp/ne_10m_admin_1_states_provinces_lakes.shp \
		-o $@ format=geojson force
	rm -rf tmp

geojson/wisconsin.json: geojson/states.json
	mapshaper \
		-i $< \
		-filter 'name === "Wisconsin"' \
		-o $@ format=geojson force

tif/snow-%.tif:
	$(eval year := $(word 2, $(subst -, ,$(subst .tif,,$@))))
	$(eval month := $(word 3, $(subst -, ,$(subst .tif,,$@))))
	mkdir -p daily-files tif
	-python snowfall.py download-month \
		--year $(year) \
		--month $(month) \
		--directory daily-files
	python raster-mill.py aggregate daily-files/$(year)-$(month)-*.tif $@

tif/snow-2019-02.tif:
	$(eval year := $(word 2, $(subst -, ,$(subst .tif,,$@))))
	$(eval month := $(word 3, $(subst -, ,$(subst .tif,,$@))))
	mkdir -p daily-files tif
	python snowfall.py download-range \
		--start $(START_DATE) \
		--end $(END_DATE) \
		--directory daily-files
	python raster-mill.py aggregate daily-files/$(year)-$(month)-*.tif $@
	

tif/wi-snow-%.tif: tif/snow-%.tif geojson/wisconsin.json
	rm -rf tmp
	mkdir -p tmp tif
	python raster-mill.py knockout --less-than 0 $< tmp/knocked-out.tif
	rio clip \
		--bounds "$(shell fio info geojson/wisconsin.json --bounds)" \
		tmp/knocked-out.tif \
		tmp/clipped.tif
	rio warp \
		--overwrite \
		--res 1000 \
		--resampling lanczos \
		--dst-crs '+proj=tmerc +lat_0=0 +lon_0=-90 +k=0.9996 +x_0=520000 +y_0=-4480000 +ellps=GRS80 +units=m +no_defs' \
		tmp/clipped.tif \
		$@
	rm -rf tmp

png/wi-snow-colored-%.png: tif/wi-snow-%.tif color-ramp.txt
	mkdir -p $(dir $@)
	gdaldem color-relief -of PNG $< color-ramp.txt $@
	rm -rf png/*.png.aux.xml
