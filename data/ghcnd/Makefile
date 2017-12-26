
GENERATED_FILES = \
	txt/ghcnd-stations.txt \
	csv/snow-accumulation.csv

all: $(GENERATED_FILES)

# Search txt/ghcnd-stations.txt to find...
# USW00014839 = Milwaukee Mitchell Airport weather station
# USW00014922 = Minneapolis Airport
# etc...
txt/ghcnd-stations.txt:
	mkdir -p $(dir $@)
	curl -o $@.download 'https://www1.ncdc.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt'
	mv $@.download $@

dly/%.dly:
	mkdir -p $(dir $@)
	curl -o $@.download 'https://www1.ncdc.noaa.gov/pub/data/ghcn/daily/all/$(notdir $@)'
	mv $@.download $@

csv/mke-weather.csv: dly/USW00014839.dly
	mkdir -p $(dir $@)
	node bin/parse-ghcnd.js -i $< -o $@

csv/snow-accumulation.csv: csv/mke-weather.csv
	mkdir -p $(dir $@)
	python bin/get-snow-accumulation.py < $< > $@

