#!/usr/bin/env python

import datetime
import re
import tempfile
from functools import reduce
import click
import requests
import rasterio

def days_in_month(year, month):
    d0 = datetime.date(year, month, 1)
    d1 = datetime.date(year, month + 1, 1)
    return (d1 - d0).days

def dates_in_month(year, month):
    n = days_in_month(year, month)
    days = range(1, n)
    return map(lambda day: datetime.date(year, month, day), days)

def validate_date(context, parameter, value):
    try:
        pattern = re.compile('(\d{4})-(\d{2})-(\d{2})')
        match = pattern.search(value)
        if match is None:
            raise click.BadParameter('Date needs to be in format YYYY-MM-DD')
        [year, month, day] = map(lambda i: int(match.group(i)), (1, 2, 3))
        return datetime.date(year, month, day)
    except ValueError:
        raise click.BadParameter('Date needs to be in format YYYY-MM-DD')

def build_url(date, hour, length):
    parameters = {
        'year': str(date.year),
        'month': '{month:0>2}'.format(month=date.month),
        'day': '{day:0>2}'.format(day=date.day),
    }
    if (length == 'season'):
        parameters.update({'hour': '12'})
        template = ('https://www.nohrsc.noaa.gov/snowfall/data/{year}{month}/'
                    'sfav2_CONUS_{year}093012_to_{year}{month}{day}{hour}.tif')
    else:
        parameters.update({
            'length': length,
            'hour': '{hour:0>2}'.format(hour=hour),
        })
        template = ('https://www.nohrsc.noaa.gov/snowfall/data/{year}{month}/'
                    'sfav2_CONUS_{length}_{year}{month}{day}{hour}.tif')
    return template.format(**parameters)

@click.group()
def cli():
    pass

@cli.command()
@click.option('-o', '--output', type=click.File('wb'), required=True,
    help='Output filename')
@click.option('-d', '--date', callback=validate_date,
    help='Ending date for accumulation (YYYY-MM-DD)')
@click.option('-h', '--hour', type=click.Choice(['0', '6', '12', '18']),
    help='Ending hour of the day for accumulation')
@click.option('-l', '--length', type=click.Choice(['6h', '24h', '48h', '72h', 'season']),
    help='Timespan of accumulation')
def download(output, date, hour, length):
    '''
    Download a snow accumulation file.
    
    Data comes from the National Snowfall Analysis program and is
    available for several timespans: 6 hours, 1 day, 2 days, 3 days
    and the entire season.
    '''
    url = build_url(date, hour, length)
    r = requests.get(url, stream=True)
    status_code = r.status_code
    if (status_code < 200) or (status_code >= 300):
        raise click.ClickException(
            'Download failed...\n' +
            'Status code: {status_code}\n'.format(status_code=status_code) +
            'URL: {url}\n'.format(url=url)
        )
    content = r.iter_content(chunk_size=1024)
    num_chunks = int(r.headers['Content-length']) / 1024
    with click.progressbar(content, length=num_chunks, label='Downloading GeoTIFF') as bar:
        for chunk in bar:
            if chunk:
                output.write(chunk)

@cli.command()
@click.option('-o', '--output', type=click.File('wb'), required=True,
    help='Output filename')
@click.option('-y', '--year', help='Year (YYYY)', type=int)
@click.option('-m', '--month', help='Month (MM)', type=int)
def download_month(output, year, month):
    '''
    Download and aggregate a month of snow accumulation data.
    '''
    dates = list(dates_in_month(year, month))[1:2]
    files = []
    datasets = []
    bands = []
    for date in dates:
        url = build_url(date, 0, '24h')
        r = requests.get(url)
        status_code = r.status_code
        if (status_code < 200) or (status_code >= 300):
            raise click.ClickException(
                'Download failed...\n' +
                'Status code: {status_code}\n'.format(status_code=status_code) +
                'URL: {url}\n'.format(url=url)
            )
        with tempfile.NamedTemporaryFile() as tmpfile:
            tmpfile.write(r.content)
            with rasterio.open(tmpfile.name) as dataset:
                datasets.append(dataset)
                band = dataset.read(1, masked=True)
                bands.append(band)
    aggregated_band = reduce(lambda a, b: a + b, bands)
    parameters = {
        'driver': 'GTiff',
        'height': datasets[0].shape[0],
        'width': datasets[0].shape[1],
        'crs': datasets[0].crs,
        'transform': datasets[0].transform,
        'count': 1,
        'dtype': bands[0].dtype,
        'nodata': datasets[0].nodata,
    }
    with rasterio.open(output, 'w', **parameters) as out_file:
        out_file.write(aggregated_band, 1)
            
@cli.command()
@click.argument('src', type=click.Path(exists=True), nargs=-1)
@click.argument('dst', type=click.Path(), nargs=1)
def aggregate(src, dst):
    datasets = []
    bands = []
    for path in src:
        dataset = rasterio.open(path, 'r')
        datasets.append(dataset)
        band = dataset.read(1, masked=True)
        bands.append(band)
    aggregated_band = reduce(lambda a, b: a + b, bands)
    parameters = {
        'driver': 'GTiff',
        'height': datasets[0].shape[0],
        'width': datasets[0].shape[1],
        'crs': datasets[0].crs,
        'transform': datasets[0].transform,
        'count': 1,
        'dtype': bands[0].dtype,
        'nodata': datasets[0].nodata,
    }
    with rasterio.open(dst, 'w', **parameters) as out_file:
        out_file.write(aggregated_band, 1)

if __name__ == '__main__':
    cli()
