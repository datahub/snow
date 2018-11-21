#!/usr/bin/env python

import datetime
import re
import click
import requests
import pathlib

directory_type = click.Path(exists=True, file_okay=False, dir_okay=True)

def date_range(start, end):
    n = (end - start).days
    return [start + datetime.timedelta(days=x) for x in range(0, n + 1)]

def dates_in_month(year, month):
    m0 = month
    y0 = year
    m1 = month + 1 if month < 12 else 1
    y1 = year if month < 12 else year + 1
    start = datetime.date(y0, m0, 1)
    end = datetime.date(y1, m1, 1) - datetime.timedelta(days=1)
    return date_range(start, end)

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

def validate_month(context, parameter, value):
    try:
        pattern = re.compile('(\d{4})-(\d{2})')
        match = pattern.search(value)
        if match is None:
            raise click.BadParameter('Year/month needs to be in format YYYY-MM')
        [year, month] = map(lambda i: int(match.group(i)), (1, 2))
        return datetime.date(year, month, 1)
    except ValueError:
        raise click.BadParameter('Year/month needs to be in format YYYY-MM')

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
@click.option('-o', '--output', type=click.Path(), required=True,
    help='Output filename')
@click.option('-d', '--date', callback=validate_date, required=True,
    help='Ending date for accumulation (YYYY-MM-DD)')
@click.option('-h', '--hour', type=click.Choice(['0', '6', '12', '18']),
    required=True, help='Ending hour of the day for accumulation')
@click.option('-l', '--length', type=click.Choice(['6h', '24h', '48h', '72h', 'season']),
    required=True, help='Timespan of accumulation')
@click.option('--overwrite', help="Overwrite file if it already exists",
    is_flag=True, default=False)
def download_file(output, date, hour, length, overwrite):
    '''
    Download a snow accumulation file.
    
    Data comes from the National Snowfall Analysis program and is
    available for several timespans: 6 hours, 1 day, 2 days, 3 days
    and the entire season.
    '''
    if not overwrite:
        out_file = pathlib.Path(output)
        file_exists = out_file.exists()
        if file_exists:
            return None

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
    progress_label = 'Downloading {filename}'.format(filename=output)
    with open(output, 'wb') as out_file:
        with click.progressbar(content, length=num_chunks, label=progress_label) as bar:
            for chunk in bar:
                if chunk:
                    out_file.write(chunk)

@cli.command()
@click.option('-d', '--directory', type=directory_type,
    default='.', help='Output directory')
@click.option('-s', '--start', help='Start date (YYYY-MM-DD)', callback=validate_date,
    required=True)
@click.option('-e', '--end', help='End date (YYYY-MM-DD)', callback=validate_date,
    required=True)
@click.option('--overwrite', help="Overwrite file if it already exists",
    is_flag=True, default=False)
@click.pass_context
def download_range(context, directory, start, end, overwrite):
    '''
    Download snow accumulation data for a range of days.

    Each day of snow accumulation is saved as a separate file in
    the directory you choose. Filenames follow a year-month-day
    format: YYYY-MM-DD.tif.
    '''
    dates = date_range(start, end)
    files = []
    datasets = []
    bands = []
    if not directory.endswith('/'):
        directory += '/'
    for date in dates:
        filename_parameters = {
            'directory': directory,
            'year': str(date.year),
            'month': '{month:0>2}'.format(month=date.month),
            'day': '{day:0>2}'.format(day=date.day),
        }
        filename = '{directory}{year}-{month}-{day}.tif'.format(**filename_parameters)
        output = click.Path().convert(filename, None, context)
        download_parameters = {
            'output': output,
            'date': date,
            'hour': '12',
            'length': '24h',
            'overwrite': overwrite,
        }
        context.invoke(download_file, **download_parameters)

@cli.command()
@click.option('-d', '--directory', type=directory_type,
    default='.', help='Output directory')
@click.option('-y', '--year', help='Year (YYYY)', type=int)
@click.option('-m', '--month', help='Month (MM)', type=int)
@click.option('--overwrite', help="Overwrite file if it already exists",
    is_flag=True, default=False)
@click.pass_context
def download_month(context, directory, year, month, overwrite):
    '''
    Download snow accumulation data for all days in a month.

    Each day of snow accumulation is saved as a separate file in
    the directory you choose. Filenames follow a year-month-day
    format: YYYY-MM-DD.tif.
    '''
    dates = dates_in_month(year, month)
    start = dates[0]
    end = dates[-1]
    download_parameters = {
        'directory': directory,
        'start': start,
        'end': end,
        'overwrite': overwrite,
    }
    context.invoke(download_range, **download_parameters)

if __name__ == '__main__':
    cli()
