#!/usr/bin/env bash

cd ghcnd
rm dly/*.dly
make
cd ..
cp ghcnd/csv/snow-accumulation.csv data-for-graphics/snow-accumulation.csv
