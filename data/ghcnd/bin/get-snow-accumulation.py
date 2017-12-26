#!/usr/bin/env python

import sys
import pandas as pd

d = pd.read_csv(sys.stdin)

# Filter to only snowfall rows
d = d[d.element == 'SNOW']

# Filter to non-null rows
d = d[pd.notnull(d.value)]

# Add snowfall (mm) column, a copy of the value column
d['snowfall'] = d['value']

# Convert date string to date
d['date'] = pd.to_datetime(d['date'])

# Filter to only wintery date (Oct. through April)
d = d[(d.date.dt.month < 5) | (d.date.dt.month > 9)]

# Sort by date (oldest to newest)
d.sort_values('date')

# Add column for winter year (e.g., 1938-39 = winter of 1938)
def get_winter_year(date_series):
    def apply_func(date):
        if (date.month > 9):
            return date.year
        else:
            return date.year - 1
    return date_series.apply(apply_func)

d['winter_year'] = get_winter_year(d['date'])

# Calculate snow accumulation (mm) for each winter
d['snow_accumulation'] = d.groupby('winter_year').snowfall.cumsum()

# Select only date, winter and snow accumulation
d = d[['date', 'winter_year', 'snow_accumulation']]

d.to_csv(sys.stdout, index = False)
