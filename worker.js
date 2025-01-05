// worker.js

onmessage = async function(e) {
    const { symbolsData, timeframe, emaPeriod } = e.data;

    // Funzione per recuperare le candele (klines) da Binance
    async function fetchKlines(symbol, timeframe, limit) {
        const url = `https://api.binance.com/api/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`;
        const response = await fetch(url);
        return await response.json();
    }

    // Funzione per calcolare l'EMA
    function calculateEMA(prices, period) {
        let k = 2 / (period + 1);
        let ema = [prices[0]];  // Primo valore è la stessa apertura
        for (let i = 1; i < prices.length; i++) {
            ema.push(prices[i] * k + ema[i - 1] * (1 - k));
        }
        return ema;
    }

    // Analisi dei dati per ogni simbolo
    const results = [];

    for (let symbol of symbolsData) {
        const klines = await fetchKlines(symbol.symbol, timeframe, emaPeriod + 1);
        const closingPrices = klines.map(kline => parseFloat(kline[4]));  // Prezzo di chiusura
        const times = klines.map(kline => new Date(kline[0]).toLocaleString());  // Orario delle candele
        const ema = calculateEMA(closingPrices, emaPeriod);
        const lastPrice = closingPrices[closingPrices.length - 1];
        const lastEma = ema[ema.length - 1];
        const lastTime = times[times.length - 1];  // Ultimo orario della candela

        let condition = "";
        if (lastPrice > lastEma && closingPrices[closingPrices.length - 2] <= ema[ema.length - 2]) {
            condition = "Crossover";
            results.push({
                symbol: symbol.symbol,
                condition: condition,
                price: lastPrice.toFixed(2),
                time: lastTime,
                ema: lastEma.toFixed(2)
            });
        } else if (lastPrice < lastEma && closingPrices[closingPrices.length - 2] >= ema[ema.length - 2]) {
            condition = "Crossunder";
            results.push({
                symbol: symbol.symbol,
                condition: condition,
                price: lastPrice.toFixed(2),
                time: lastTime,
                ema: lastEma.toFixed(2)
            });
        }
    }

    // Invia i risultati al thread principale
    postMessage(results);
};
