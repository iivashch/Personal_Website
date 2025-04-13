/*

// handler.js

require('dotenv').config();
const { MongoClient } = require('mongodb');
const yahooFinance = require('yahoo-finance2').default;
const axios = require('axios');

// Environment Variables
const FRED_API_KEY = process.env.FRED_API;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Setup
const client = new MongoClient(MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
});
const db = client.db('dashboard');
const collection = db.collection('snapshots');

// Constants
const FRED_INDICATORS = {
  CPI: 'CPIAUCSL',
  PPI: 'PPIACO',
  'Unemployment Rate': 'UNRATE',
  NFP: 'PAYEMS',
  'Consumer Sentiment': 'UMCSENT',
  'Yield Curve': 'T10Y2Y',
  '10Y Bond': 'GS10',
  'Dollar Index': 'DTWEXBGS',
  'CBOE Gold ETF': 'GVZCLS',
  'Oil Futures Brent': 'DCOILBRENTEU',
};

const STOCKS = ['^GSPC', '^N100', '000001.SS'];

// Helpers
async function getStockData() {
  const quotes = [];

  for (const symbol of STOCKS) {
    try {
      const quote = await yahooFinance.quote(symbol);
      quotes.push({
        symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        percentChange: quote.regularMarketChangePercent,
      });
    } catch (err) {
      console.error(`Error fetching stock ${symbol}:`, err.message);
    }
  }

  return quotes;
}

async function getFredData() {
  const data = {};
  const today = new Date().toISOString().split('T')[0];

  for (const [label, seriesId] of Object.entries(FRED_INDICATORS)) {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc`;
      const res = await axios.get(url);
      const latest = res.data.observations.find(obs => obs.value !== ".");

      if (latest) {
        data[label] = {
          date: latest.date,
          value: parseFloat(latest.value),
        };
      }
    } catch (err) {
      console.error(`Error fetching FRED data for ${label}:`, err.message);
    }
  }

  return data;
}

// Main Execution
async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const snapshot = {
      timestamp: new Date(),
      stocks: await getStockData(),
      fred: await getFredData(),
    };

    await collection.insertOne(snapshot);
    console.log('Snapshot inserted');
  } catch (err) {
    console.error('Error running handler:', err.message);
  } finally {
    await client.close();
  }
}

run();
*/