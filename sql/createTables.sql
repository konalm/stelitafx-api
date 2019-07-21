/**
 *
 */
CREATE TABLE IF NOT EXISTS currency_wma (
  id INT AUTO_INCREMENT,
  abbrev CHAR(7),
  FOREIGN KEY (abbrev)
    REFERENCES currency_pair(abbrev)
    ON DELETE CASCADE,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  wma_data_json LONGTEXT,
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
