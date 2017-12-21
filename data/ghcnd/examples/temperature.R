# See how the daily max temperature this year compares to the max
# temperature from past years, dating back to 1938

library(tidyverse)
library(stringr)
library(lubridate)

d <- read_csv('csv/mke-weather.csv', col_types = cols(flag_m = 'c'))

tmax <- d %>%
  filter(element == 'TMAX') %>%
  mutate(temperature = (value / 10) * (9/5) + 32) %>%
  mutate(year = year(date),
         day_of_year = yday(date))

tmax %>%
  ggplot(aes(x = day_of_year, y = temperature)) %+%
  geom_line(alpha = 0.1) %+%
  geom_line(data = tmax %>% filter(year == 2017), alpha = 1)
