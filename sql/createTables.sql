/**
 *
 */
CREATE TABLE IF NOT EXISTS tradeV2 (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  FOREIGN KEY (abbrev)
    REFERENCES currency_pair(abbrev)
    ON DELETE CASCADE,
  proto_no INTEGER,
  FOREIGN KEY (proto_no)
    REFERENCES algorithm(prototype_no)
    ON DELETE CASCADE,
  open_rate DECIMAL(20,10),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  close_date TIMESTAMP NULL,
  close_rate DECIMAL(20,10),
  open_notes LONGTEXT NULL,
  close_notes LONGTEXT NULL,
  closed BOOLEAN DEFAULT false,
  viewed BOOLEAN DEFAULT false,
  PRIMARY KEY(id)
);

ALTER TABLE tradeV2 ADD COLUMN open_stats LONGTEXT NULL;
ALTER TABLE tradeV2 ADD COLUMN time_interval INT NULL;
ALTER TABLE tradeV2 ADD COLUMN account VARCHAR(50) NULL;
ALTER TABLE tradeV2 ADD COLUMN uuid VARCHAR(36) NULL;
ALTER TABLE tradeV2 ADD COLUMN currency_rate_source VARCHAR(255) NULL;

/**
 *
 */
CREATE TABLE IF NOT EXISTS trade_oandatrade (
  id INT NOT NULL AUTO_INCREMENT,
  trade_uuid VARCHAR(36) NOT NULL,
  oandatrade_id INTEGER NOT NULL,
  PRIMARY KEY(id)
);

ALTER TABLE trade_oandatrade RENAME COLUMN oanda_opentrade_id NOT NULL;
ALTER TABLE trade_oandatrade ADD COLUMN oanda_closetrade_id NULL;
 
/**
 *
 */
CREATE TABLE IF NOT EXISTS currency_wma (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  rate DECIMAL(20,10),
  FOREIGN KEY (abbrev)
    REFERENCES currency_pair(abbrev)
    ON DELETE CASCADE,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  wma_data_json LONGTEXT,
  PRIMARY KEY(id)
);

ALTER TABLE currency_wma ADD COLUMN time_interval INT NULL;


/**
 *
 */
CREATE TABLE IF NOT EXISTS fixerio_currency_wma (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  rate DECIMAL(20,10),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  wma_data_json LONGTEXT,
  time_interval INT NULL,
  PRIMARY KEY(id)
);


/**
 * Create currency table
 */
 CREATE TABLE IF NOT EXISTS currency (
   id INT NOT NULL AUTO_INCREMENT,
   name VARCHAR(255),
   abbrev CHAR(3),
   PRIMARY KEY(id),
   UNIQUE KEY(abbrev)
 );


/**
 * Create currency pair table
 */
CREATE TABLE IF NOT EXISTS currency_pair (
  id INT AUTO_INCREMENT,
  base_currency CHAR(3),
  FOREIGN KEY (base_currency)
    REFERENCES currency(abbrev)
    ON DELETE CASCADE,
  quote_currency CHAR(3),
  FOREIGN KEY (quote_currency)
    REFERENCES currency(abbrev)
    ON DELETE CASCADE,
  abbrev CHAR(7),
  PRIMARY KEY(id),
  UNIQUE KEY(abbrev)
);


/**
 * Create currency rate table
 */
CREATE TABLE IF NOT EXISTS currency_rate (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  FOREIGN KEY (abbrev)
    REFERENCES currency_pair(abbrev)
    ON DELETE CASCADE,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exchange_rate DECIMAL(20,10),
  PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS fixerio_currency_rate (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exchange_rate DECIMAL(20,10),
  PRIMARY KEY(id)
);


CREATE TABLE IF NOT EXISTS currency_rate (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  FOREIGN KEY (abbrev)
    REFERENCES currency_pair(abbrev)
    ON DELETE CASCADE,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exchange_rate DECIMAL(20,10),
  PRIMARY KEY(id)
);


/**
 * Create multi rate table 
 */
CREATE TABLE IF NOT EXISTS multi_rate (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  oanda_demo_rate DECIMAL(20,10),
  oanda_fxaccount_rate DECIMAL(20,10),
  fixerio_rate DECIMAL(20,10),
  PRIMARY KEY(id)
);


/**
* Create algo table
*/
CREATE TABLE IF NOT EXISTS algorithm (
  id INT AUTO_INCREMENT,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  prototype_no INTEGER,
  description LONGTEXT NULL,
  PRIMARY KEY(id),
  UNIQUE KEY(prototype_no)
);


/**
 * Create trade table
 */
CREATE TABLE IF NOT EXISTS trade (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  FOREIGN KEY (abbrev)
    REFERENCES currency_pair(abbrev)
    ON DELETE CASCADE,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction CHAR(4),
  algo_proto_no INTEGER,
  FOREIGN KEY (algo_proto_no)
    REFERENCES algorithm(prototype_no)
    ON DELETE CASCADE,
  rate DECIMAL(20,10),
  PRIMARY KEY(id)
);


CREATE TABLE IF NOT EXISTS oanda_trade_transactions (
  id INT AUTO_INCREMENT,
  trade_id INT NOT NULL,
  json LONGTEXT NOT NULL,
  PRIMARY KEY(id)
);
ALTER TABLE oand4a_trade_transactions 
ADD UNIQUE KEY(trade_id);


ALTER TABLE Persons
ADD CONSTRAINT UC_Person UNIQUE (ID,LastName);


CREATE TABLE IF NOT EXISTS charting_wma_options (
  uuid VARCHAR(36) AUTO_INCREMENT NOT NULL,
  description VARCHAR(255) NOT NULL,
  options_json LONGTEXT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(uuid)
);

CREATE TABLE IF NOT EXISTS charting_wma_options (
  uuid VARCHAR(36) NOT NULL,
  description VARCHAR(255) NOT NULL,
  options_json LONGTEXT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(uuid)
);