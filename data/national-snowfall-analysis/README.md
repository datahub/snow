# National Snowfall Analysis

**[National Snowfall Analysis](https://www.nohrsc.noaa.gov/snowfall/):**
Provides gridded snow accumulation for various time spans: 24-hr, 48-hr, 72-hr and season-total accumulation.

The grid resolution is 0.04 degrees (144 arc sec). Data come in a few formats: NetCDF, GeoTIFF, GRIB2. They can be projected or unprojected.

The 24-hour periods start at either 00:00 UTC (midnight) or 12:00 UTC (midnight). Universal Time (UTC) is six hours ahead of U.S. Central Standard Time (CST). So these times are equivalent to 6:00 PM the previous day and 6:00 AM the same day.

## Usage

This folder contains the instructions to pull gridded snow accumulation data from the National Snowfall Analysis program.

First you'll need to install some Node.js packages.
```bash
npm install
```

The `Makefile` contains instructions for downloading some of the data. At the command-line run:
```bash
make
```
For the moment, it downloads the 72-hour snow accumulation at one point in time.

## Links
- [Technical documentation](http://www.nws.noaa.gov/os/notification/tin15-05bigrsc_snowfall_aaa.htm)
- [FTP containing all of the data](https://www.nohrsc.noaa.gov/snowfall/data/)
