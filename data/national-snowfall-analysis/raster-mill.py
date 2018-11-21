#!/usr/bin/env python

from functools import reduce
import click
import rasterio
import numpy as np

@click.group()
def cli():
    pass
    
@cli.command()
@click.option('-m', '--method', type=click.Choice(['add', 'multiply', 'subtract', 'divide']),
    default='add', help='Aggregation method')
@click.argument('input', type=click.Path(exists=True), nargs=-1)
@click.argument('output', type=click.Path(), nargs=1)
def aggregate(method, input, output):
    '''
    Aggregate multiple rasters into one.

    There are four aggregation methods: add, multiply, subtract and divide.
    Only the first band of a raster is used. The input file must be a GeoTiff.
    '''
    datasets = []
    bands = []
    for path in input:
        dataset = rasterio.open(path, 'r')
        datasets.append(dataset)
        band = dataset.read(1, masked=True)
        bands.append(band)
    
    if method == 'add':
        reducer = lambda a, b: a + b
    elif method == 'multiply':
        reducer = lambda a, b: a * b
    elif method == 'subtract':
        reducer = lambda a, b: a - b
    elif method == 'divide':
        reducer = lambda a, b: a / b

    aggregated_band = reduce(reducer, bands)
    
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
@click.option('-e', '--equal-to', type=float,
    help='Knock out pixels with this value.')
@click.option('-l', '--less-than', type=float,
    help='Knock out pixels less than this value.')
@click.option('-g', '--greater-than', type=float,
    help='Knock out pixels greater than this value.')
@click.option('-n', '--no-data', type=float, default=-99999.0,
    help='No data value to use.')
@click.argument('input', type=click.Path(exists=True), nargs=1)
@click.argument('output', type=click.Path(), nargs=1)
def knockout(equal_to, less_than, greater_than, no_data, input, output):
    '''
    Convert pixels to no data.

    Pixels get "knocked out" based on a condition you set, i.e.,
    the pixel's value is less than, equal to or greater than some
    value.
    '''
    with rasterio.open(input, 'r') as dataset:
        band = dataset.read(1, masked=True)

        mask = band.mask
        if mask is False:
            mask = np.zeros(band.shape)

        if less_than is not None:
            mask = np.logical_or(band.data < less_than, mask)
        if equal_to is not None:
            mask = np.logical_or(band.data == equal_to, mask)
        if greater_than is not None:
            mask = np.logical_or(band.data > greater_than, mask)

        band.mask = mask

        # Replace masked pixels with the no data value
        np.place(band.data, band.mask, no_data)

        parameters = {
            'driver': 'GTiff',
            'height': dataset.shape[0],
            'width': dataset.shape[1],
            'crs': dataset.crs,
            'transform': dataset.transform,
            'count': 1,
            'dtype': band.dtype,
            'nodata': no_data,
        }
        with rasterio.open(output, 'w', **parameters) as out_file:
            out_file.write(band, 1)

if __name__ == '__main__':
    cli()
