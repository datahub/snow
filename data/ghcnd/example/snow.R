# Look at the history of snow accumulation and snow depth in Milwaukee
# and Minneapolis using GHCN-Daily data.

library(tidyverse)
library(stringr)
library(lubridate)
library(ggmjs)

clean_weather <- function(d) {
  d %>%
    select(date, element, value) %>%
    spread(element, value) %>%
    select(date,
           precipitation = PRCP,
           snow = SNOW,
           snow_depth = SNWD,
           temp_max = TMAX,
           temp_min = TMIN,
           temp_avg = TAVG) %>%
    mutate(year = year(date),
           day_of_year = yday(date),
           day_of_year_normalized = if_else(leap_year(date),
                                            day_of_year,
                                            if_else(day_of_year < 60,
                                                    day_of_year,
                                                    day_of_year + 1)),
           winter = if_else(day_of_year_normalized > 274,
                            year,
                            year - 1),
           winter_day = if_else(day_of_year_normalized > 274,
                                day_of_year_normalized - 274,
                                day_of_year_normalized + 92)) %>%
    arrange(date) %>%
    group_by(winter) %>%
    mutate(snow_accum = cumsum(coalesce(snow, 0L))) %>%
    ungroup()
}

mke <- read_csv('csv/mke-weather.csv', col_types = cols(flag_m = 'c')) %>%
  clean_weather() %>%
  mutate(station = 'mke')

mpls <- read_csv('csv/mpls-weather.csv', col_types = cols(flag_m = 'c')) %>%
  clean_weather() %>%
  mutate(station = 'mpls')
  
d <- bind_rows(mke, mpls)

# Snow depth
d %>%
  ggplot(aes(x = winter_day, y = snow_depth, group = winter)) %+%
  geom_line(alpha = 0.05) %+%
  geom_line(data = d %>% filter(winter == 1978), alpha = 1) %+%
  theme_mjs() %+%
  facet_wrap(~ station)

# Snow accumulation
d %>%
  ggplot(aes(x = winter_day, y = snow_accum, group = winter)) %+%
  geom_line(alpha = 0.1) %+%
  geom_line(data = d %>% filter(winter == 2017), alpha = 1) %+%
  theme_mjs() %+%
  facet_wrap(~ station)

d %>%
  ggplot(aes(x = winter_day, y = snow_accum)) %+%
  stat_density_2d(geom = "raster", aes(fill = ..density..), contour = FALSE) %+%
  theme_mjs() %+%
  facet_wrap(~ station) %+%
  scale_fill_distiller()
