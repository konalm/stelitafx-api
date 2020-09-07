const { get } = require("@/services/oandaApiHttpRequest");

module.exports = async (gran, abbrev, count) => {
  const instrument = abbrev.replace("/", "_");
  const path = `instruments/${instrument}/candles?granularity=${gran}&count=${count}`;

  let response;
  try {
    response = await get(path);
  } catch (e) {
    throw new Error(e);
  }

  return response.candles.map((x) => ({
    date: new Date(x.time),
    open: parseFloat(x.mid.o),
    low: parseFloat(x.mid.l),
    high: parseFloat(x.mid.h),
    close: parseFloat(x.mid.c),
  }));
};
