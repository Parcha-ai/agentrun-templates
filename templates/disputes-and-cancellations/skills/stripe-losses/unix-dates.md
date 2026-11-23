# Stripe times and dates

Stripe gives every time as a Unix number: seconds since 1970-01-01 00:00 UTC. Work dates out from this table, never
from memory. A day is 86400 seconds, an hour 3600.

The Unix number at 00:00 UTC on the first of each month:

| Year | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026 | 1767225600 | 1769904000 | 1772323200 | 1775001600 | 1777593600 | 1780272000 | 1782864000 | 1785542400 | 1788220800 | 1790812800 | 1793491200 | 1796083200 |
| 2027 | 1798761600 | 1801440000 | 1803859200 | 1806537600 | 1809129600 | 1811808000 | 1814400000 | 1817078400 | 1819756800 | 1822348800 | 1825027200 | 1827619200 |
| 2028 | 1830297600 | 1832976000 | 1835481600 | 1838160000 | 1840752000 | 1843430400 | 1846022400 | 1848700800 | 1851379200 | 1853971200 | 1856649600 | 1859241600 |

**A date and time to a Unix number.** Take the month's number, add (day - 1) x 86400, then hours x 3600 and minutes x
60. 2026-11-23 09:00 UTC: 1793491200 + 22 x 86400 + 9 x 3600 = 1795424400.

**A Unix number to a date.** Find the largest month start not above it. Subtract, divide by 86400: the whole part plus
one is the day of the month, and the rest divided by 3600 is the hour (UTC). 1795528800: Nov 2026 (1793491200), 2037600
over, 23 whole days and 50400 seconds, so 2026-11-24 14:00 UTC.

**A time zone.** Work in UTC first, then shift by the zone's offset on that date (America/New_York is UTC-5 in winter
and UTC-4 in summer; Europe/Madrid UTC+1 and UTC+2). A shift can move the date by one day.

Write the arithmetic out in your reasoning. Compare two times by their Unix numbers, never by dates you worked out.
