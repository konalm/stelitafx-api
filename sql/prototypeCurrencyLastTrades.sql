SELECT t.id, t.proto_no, t.abbrev, t.date, t.closed, t.open_rate, t.time_interval
FROM stelita.tradeV2 t
INNER JOIN (
  SELECT proto_no, abbrev, time_interval, MAX(date) date
  FROM stelita.tradeV2
  GROUP BY proto_no, abbrev, time_interval
) b ON b.proto_no = t.proto_no  AND b.abbrev = t.abbrev AND b.date = t.date 
ORDER BY date ASC;



SELECT a.id, a.rev, a.contents
FROM YourTable a
INNER JOIN (
    SELECT id, MAX(rev) rev
    FROM YourTable
    GROUP BY id
) b ON a.id = b.id AND a.rev = b.rev


SELECT t.id, t.proto_no, t.abbrev, t.date, t.closed, t.open_rate, t.time_interval
FROM stelita.tradeV2 t
INNER JOIN (
  SELECT proto_no, abbrev, time_interval, MAX(date) date
  FROM stelita.tradeV2
  GROUP BY proto_no, abbrev, time_interval
) b ON b.proto_no = t.proto_no  AND b.abbrev = t.abbrev AND b.date = t.date 
WHERE t.time_interval = 1
ORDER BY proto_no ASC;




 SELECT 
  c.abbrev, 
  c.date, 
  c.exchange_rate
FROM stelita.currency_rate c
INNER JOIN (
  SELECT abbrev, MAX(date) date
  FROM stelita.currency_rate
  GROUP BY abbrev
) b ON b.abbrev = c.abbrev  AND b.date = c.date 


    