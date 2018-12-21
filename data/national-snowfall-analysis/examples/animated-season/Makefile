
GENERATED_FILES := 	\
	tif/wi-snow-2017-10.tif \
	tif/wi-snow-2017-11.tif \
	tif/wi-snow-2017-12.tif \
	tif/wi-snow-2018-01.tif \
	tif/wi-snow-2018-02.tif \
	tif/wi-snow-2018-03.tif \
	tif/wi-snow-2018-04.tif

all: $(GENERATED_FILES)

zip/states.zip:
	mkdir -p $(dir $@)
	curl -Lk -o $@.download 'https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_1_states_provinces_lakes.zip'
	mv $@.download $@

geojson/states.geojson: zip/states.zip
	mkdir -p $(dir $@) tmp
	unzip -d tmp $<
	mapshaper \
		-i tmp/ne_10m_admin_1_states_provinces_lakes.shp \
		-o $@ format=geojson force
	rm -rf tmp

geojson/wisconsin.json: geojson/states.geojson
	mapshaper \
		-i $< \
		-filter 'name === "Wisconsin"' \
		-o $@ format=geojson force

tif/snow-%.tif:
	$(eval year := $(word 2, $(subst -, ,$(subst .tif,,$@))))
	$(eval month := $(word 3, $(subst -, ,$(subst .tif,,$@))))
	mkdir -p daily-files tif
	python ../../snowfall.py download-month \
		--year $(year) \
		--month $(month) \
		--directory daily-files
	python ../../raster-mill.py aggregate daily-files/$(year)-$(month)-*.tif $@

tif/wi-snow-%.tif: tif/snow-%.tif geojson/wisconsin.json
	mkdir -p tmp tif
	python ../../raster-mill.py knockout --less-than 0 $< tmp/knocked-out.tif
	rio clip --bounds "$(shell fio info geojson/wisconsin.json --bounds)" tmp/knocked-out.tif tmp/clipped.tif
	rio warp \
		--res 1000 \
		--resampling lanczos \
		--dst-crs '+proj=tmerc +lat_0=0 +lon_0=-90 +k=0.9996 +x_0=520000 +y_0=-4480000 +ellps=GRS80 +units=m +no_defs' \
		 tmp/clipped.tif $@
	rm -rf tmp

