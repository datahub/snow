#!/usr/bin/env node

import sys
import datetime
import pandas as pd

data = []

def parse_value(value):
    if value == '-9999':
        return None
    else:
        return int(value)

def parse_line(line):
    id = line[0:11]
    year = int(line[11:15])
    month = int(line[15:17])
    element = line[17:21]

    rows = []
    stub = line[21:]
    day = 1
    while len(stub) > 0:
        try:
            date = datetime.date(year, month, day)
            row = {
                'id': id,
                'date': date.strftime('%Y-%m-%d'),
                'element': element,
                'value': parse_value(stub[0:5]),
                'flag_m': stub[5:6],
                'flag_q': stub[6:7],
                'flag_s': stub[7:8]
            }
            rows.append(row)
        except:
            pass
        stub = stub[8:]
        day += 1
    return rows

for line in sys.stdin:
    data += parse_line(line)

pd.DataFrame(data).to_csv(sys.stdout, index=False)
