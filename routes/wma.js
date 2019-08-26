
module.exports = (app) => {
  /**
   * Get WMA data for a trade
   */
  app.get('/currency/:currency/buy_trade/:trade_id/sell_trade/:sell_trade',
    async (req, res) =>
  {

    /* get date of buy and sell trade */
    /* make sure the buy trade is before the sell trade */
  });
}
