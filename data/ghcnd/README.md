# Global Historical Climate Network (Daily)

The Global Historical Climate Network (GHCN) provides, among other things, daily climate summaries from land surface stations. This includes snowfall and snow depth. This historical data can be used to show how this winter's snow accumulation in Milwaukee compares to all past winters dating back to 1938.

## Usage

This folder contains the instructions for pull GHCN daily data for any land-based weather station in the network, including Milwaukee.

First you'll need to install some Node.js packages.
```bash
npm install
```

The `Makefile` contains instructions for downloading and cleaning up the GHCN-Daily data from their FTP site. At the command-line run:
```bash
make
```
Currently it downloads and cleans up the entire history of climate data for Milwaukee and Minneapolis. The Makefile downloads `txt/ghcnd-stations.txt` which lists weather stations. Identify station IDs in this list and add them to the Makefile.

See the `examples/` folder for examples of how to process and analyze the data.
