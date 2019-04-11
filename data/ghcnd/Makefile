SHELL := /bin/bash

PYTHON := /code/snow/venv/bin/python

GENERATED_FILES = \
	data/mke-snow-accumulation.csv

update: destroy build upload cache-bust

destroy:
	rm -f data/dly/USW00014839.dly

build:
	. /code/snow/venv/bin/activate; $(MAKE) $(GENERATED_FILES)

upload:
	aws s3 cp data/mke-snow-accumulation.csv s3://projects.jsonline.com/apps/snow/static/

cache-bust:
	aws cloudfront create-invalidation --distribution-id E3H0OA9T40SSTC --paths /apps/snow/static/$(notdir $(GENERATED_FILES))

# Search txt/ghcnd-stations.txt to find...
# USW00014839 = Milwaukee Mitchell Airport weather station
# USW00014922 = Minneapolis Airport
# etc...
data/ghcnd-stations.txt:
	mkdir -p $(dir $@)
	curl -o $@.download 'https://www1.ncdc.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt'
	mv $@.download $@

data/dly/%.dly:
	mkdir -p $(dir $@)
	curl -o $@.download 'https://www1.ncdc.noaa.gov/pub/data/ghcn/daily/all/$(notdir $@)'
	mv $@.download $@

data/mke-weather.csv: data/dly/USW00014839.dly
	mkdir -p $(dir $@)
	$(PYTHON) parse-ghcnd.py < $< > $@

data/mke-snow-accumulation.csv: data/mke-weather.csv
	mkdir -p $(dir $@)
	$(PYTHON) get-snow-accumulation.py < $< > $@

.PHONY: destroy build upload update cache-bust
