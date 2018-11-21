# National Snowfall Analysis

**[National Snowfall Analysis](https://www.nohrsc.noaa.gov/snowfall/):**
Provides gridded snow accumulation for various time spans: 6-hr, 24-hr, 48-hr, 72-hr and season-total accumulation.

The grid resolution is 0.04 degrees (144 arc sec or about 2 miles). Data come in a few formats: NetCDF, GeoTIFF, GRIB2. They can be projected or unprojected.

The 24-hour periods start at either 00:00 UTC (midnight) or 12:00 UTC (midnight). Universal Time (UTC) is six hours ahead of U.S. Central Standard Time (CST). So these times are equivalent to 6:00 PM the previous day and 6:00 AM the same day.

## Usage

This folder contains programs for download and cleaning up snow accumulation data.

See the `/example` folder for how it can be used.

Below is the reference for the command line programs.

### `snowfall.py`
```
Usage: snowfall.py [OPTIONS] COMMAND [ARGS]...

Options:
  --help  Show this message and exit.

Commands:
  download-file   Download a snow accumulation file.
  download-month  Download snow accumulation data for all days in a month.
  download-range  Download snow accumulation data for a range of days.
```

#### `snowfall.py download-file`
```
Usage: snowfall.py download-file [OPTIONS]

  Download a snow accumulation file.

  Data comes from the National Snowfall Analysis program and is available
  for several timespans: 6 hours, 1 day, 2 days, 3 days and the entire
  season.

Options:
  -o, --output PATH               Output filename  [required]
  -d, --date TEXT                 Ending date for accumulation (YYYY-MM-DD)
                                  [required]
  -h, --hour [0|6|12|18]          Ending hour of the day for accumulation
                                  [required]
  -l, --length [6h|24h|48h|72h|season]
                                  Timespan of accumulation  [required]
  --overwrite                     Overwrite file if it already exists
  --help                          Show this message and exit.
  ```

#### `snowfall.py download-range`
```
Usage: snowfall.py download-range [OPTIONS]

  Download snow accumulation data for a range of days.

  Each day of snow accumulation is saved as a separate file in the directory
  you choose. Filenames follow a year-month-day format: YYYY-MM-DD.tif.

Options:
  -d, --directory DIRECTORY  Output directory
  -s, --start TEXT           Start date (YYYY-MM-DD)  [required]
  -e, --end TEXT             End date (YYYY-MM-DD)  [required]
  --overwrite                Overwrite file if it already exists
  --help                     Show this message and exit.
```

#### `snowfall.py download-month`
```
Usage: snowfall.py download-range [OPTIONS]

  Download snow accumulation data for a range of days.

  Each day of snow accumulation is saved as a separate file in the directory
  you choose. Filenames follow a year-month-day format: YYYY-MM-DD.tif.

Options:
  -d, --directory DIRECTORY  Output directory
  -s, --start TEXT           Start date (YYYY-MM-DD)  [required]
  -e, --end TEXT             End date (YYYY-MM-DD)  [required]
  --overwrite                Overwrite file if it already exists
  --help                     Show this message and exit.
(venv) national-snowfall-analysis $ python snowfall.py download-month --help
Usage: snowfall.py download-month [OPTIONS]

  Download snow accumulation data for all days in a month.

  Each day of snow accumulation is saved as a separate file in the directory
  you choose. Filenames follow a year-month-day format: YYYY-MM-DD.tif.

Options:
  -d, --directory DIRECTORY  Output directory
  -y, --year INTEGER         Year (YYYY)
  -m, --month INTEGER        Month (MM)
  --overwrite                Overwrite file if it already exists
  --help                     Show this message and exit.
```

### `raster-mill.py`
```
Usage: raster-mill.py [OPTIONS] COMMAND [ARGS]...

Options:
  --help  Show this message and exit.

Commands:
  aggregate  Aggregate multiple rasters into one.
  knockout   Convert pixels to no data.
```

#### `raster-mill.py aggregate`
```
Usage: raster-mill.py [OPTIONS] COMMAND [ARGS]...

Options:
  --help  Show this message and exit.

Commands:
  aggregate  Aggregate multiple rasters into one.
  knockout   Convert pixels to no data.
(venv) national-snowfall-analysis $ python raster-mill.py aggregate --help
Usage: raster-mill.py aggregate [OPTIONS] [INPUT]... OUTPUT

  Aggregate multiple rasters into one.

  There are four aggregation methods: add, multiply, subtract and divide.
  Only the first band of a raster is used. The input file must be a GeoTiff.

Options:
  -m, --method [add|multiply|subtract|divide]
                                  Aggregation method
  --help                          Show this message and exit.
```

#### `raster-mill.py knockout`
```
Usage: raster-mill.py knockout [OPTIONS] INPUT OUTPUT

  Convert pixels to no data.

  Pixels get "knocked out" based on a condition you set, i.e., the pixel's
  value is less than, equal to or greater than some value.

Options:
  -e, --equal-to FLOAT      Knock out pixels with this value.
  -l, --less-than FLOAT     Knock out pixels less than this value.
  -g, --greater-than FLOAT  Knock out pixels greater than this value.
  -n, --no-data FLOAT       No data value to use.
  --help                    Show this message and exit.
```

## Links
- [Technical documentation](http://www.nws.noaa.gov/os/notification/tin15-05bigrsc_snowfall_aaa.htm)
- [FTP containing all of the data](https://www.nohrsc.noaa.gov/snowfall/data/)
