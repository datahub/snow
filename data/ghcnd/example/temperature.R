# See how the daily max temperature this year compares to the max
# temperature from past years, dating back to 1938

library(tidyverse)
library(stringr)
library(lubridate)

d <- read_csv('csv/mke-weather.csv', col_types = cols(flag_m = 'c'))

temperature <- d %>%
  filter(element %in% c('TMAX', 'TMIN')) %>%
  mutate(temperature = (value / 10) * (9/5) + 32) %>%
  select(date, element, temperature) %>%
  spread(element, temperature) %>%
  mutate(year = year(date),
         day_of_year = yday(date),
         day_of_year_normalized = if_else(leap_year(date),
                                          day_of_year,
                                          if_else(day_of_year < 60,
                                                  day_of_year,
                                                  day_of_year + 1)))


min_max <- temperature %>%
  group_by(day_of_year_normalized) %>%
  summarize(TMAX = max(TMAX, na.rm = T),
            TMIN = min(TMIN, na.rm = T))

current <- temperature %>%
  filter(year == 2018)

min_max %>%
  ggplot(aes(x = day_of_year_normalized)) %+% 
  geom_line(aes(y = TMAX), color = 'lightgrey') %+%
  geom_line(aes(y = TMIN), color = 'lightgrey') %+%
  geom_line(data = current, aes(y = TMAX), color = 'red') %+%
  geom_line(data = current, aes(y = TMIN), color = 'blue')
