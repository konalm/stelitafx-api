INSERT INTO currency (name, abbrev)
VALUES
('US Dollar', 'USD'),
('Euro', 'EUR'),
('Japanese Yen', 'JPY'),
('British Pound', 'GBP'),
('Swiss Franc', 'CHF'),
('Canadian Dollar', 'CAD'),
('Australian Dollar', 'AUD'),
('New-Zealand Dollar', 'NZD');

INSERT INTO currency_pair (base_currency, quote_currency, abbrev)
VALUES
('EUR', 'USD', 'EUR/USD'),
('JPY', 'USD', 'JPY/USD'),
('GBP', 'USD', 'GBP/USD'),
('CHF', 'USD', 'CHF/USD'),
('CAD', 'USD', 'CAD/USD'),
('AUD', 'USD', 'AUD/USD'),
('NZD', 'USD', 'NZD/USD');
