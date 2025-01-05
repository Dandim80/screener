// Simulazione di dati per l'esempio (questo potrebbe essere integrato con chiamate API per ottenere dati reali)
const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT']; // Simboli da monitorare

function calculateEMA(prices, period) {
  let k = 2 / (period + 1);
  let ema = [prices[0]];

  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k));
  }

  return ema;
}

// Funzione per monitorare i crossover e crossunder
function monitorEMA(candles, emaPeriod) {
  const results = [];

  // Calcola EMA per ogni simbolo
  symbols.forEach(symbol => {
    const prices = candles[symbol].map(candle => candle.close);
    const ema = calculateEMA(prices, emaPeriod);

    // Controlla i crossover e crossunder
    for (let i = 1; i < ema.length; i++) {
      let condition = '';
      if (prices[i] > ema[i] && prices[i - 1] <= ema[i - 1]) {
        condition = 'Crossover EMA';
      } else if (prices[i] < ema[i] && prices[i - 1] >= ema[i - 1]) {
        condition = 'Crossunder EMA';
      }

      if (condition) {
        results.push({
          symbol: symbol,
          condition: condition,
          price: prices[i],
          timestamp: new Date().toLocaleString()
        });
      }
    }
  });

  return results;
}

// Funzione per simulare l'arrivo dei dati (può essere sostituita con API reali)
function getCandles(symbol, timeframe) {
  const candles = {};
  
  symbols.forEach(symbol => {
    // Simula delle candele per ogni simbolo
    candles[symbol] = Array.from({ length: 20 }, (_, i) => ({
      close: Math.random() * 10000 + 2000 // Prezzi casuali per l'esempio
    }));
  });
  
  return candles;
}

onmessage = function(event) {
  const { emaPeriod, timeframe } = event.data;

  // Simula i dati delle candele (sostituire con una chiamata API reale)
  const candles = getCandles(symbols, timeframe);

  // Esegui il monitoraggio delle condizioni EMA
  const results = monitorEMA(candles, emaPeriod);

  // Invia i risultati al thread principale
  postMessage({ results });
};
