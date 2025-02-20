const _ = require('lodash');
const mongoose = require( 'mongoose' );
const fetch = require("node-fetch");
const https = require('https');
const Market = require( '../db.js' ).Market;

// 10 minutes
const quoteInterval = 24 * 60 * 60 * 1000;

const getQuote = async () => {
    const options = {
        timeout: 3000
    }
    const URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${config.settings.symbol}&CMC_PRO_API_KEY=${config.CMC_API_KEY}`;

    try {
        let requestUSD = await fetch(URL);
        let requestBTC = await fetch(URL + '&convert=BTC');
        let requestINR = await fetch(URL + '&convert=INR');
        let requestEUR = await fetch(URL + '&convert=EUR');
        let quoteUSD = await requestUSD.json();
        let quoteBTC = await requestBTC.json();
        let quoteINR = await requestINR.json();
        let quoteEUR = await requestEUR.json();
        quoteObject = {
            symbol: config.settings.symbol,
            timestamp: Math.round(new Date(quoteUSD.status.timestamp).getTime() / 1000),
            quoteBTC: quoteBTC.data.XDC.quote.BTC.price,
            quoteEUR: quoteEUR.data.XDC.quote.EUR.price,
            quoteINR: quoteINR.data.XDC.quote.INR.price,
            quoteUSD: quoteUSD.data.XDC.quote.USD.price,
            volume_24h:quoteUSD.data.XDC.quote.USD.volume_24h,
            percent_change_24h: quoteUSD.data.XDC.quote.USD.percent_change_24h,
        }
        // console.log(URL)
        new Market(quoteObject).save( ( err, market, count ) => {
            console.log('Data get from market');
            console.log(quoteObject)
            if ( typeof err !== 'undefined' && err ) {
               process.exit(9);
            } else {
                console.log('DB successfully written for market quote.');
            }
        });
    } catch (error) {
        console.log(error);
    }
}


var config = { nodeAddr: 'localhost', gethPort: 8545, bulkSize: 100 };
try {
    var local = require('../config.json');
    _.extend(config, local);
    console.log('config.json found.');
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        var local = require('../config.example.json');
        _.extend(config, local);
        console.log('No config file found. Using default configuration... (config.example.json)');
    } else {
        throw error;
        process.exit(1);
    }
}

getQuote()

setInterval(() => {
    getQuote()
}, quoteInterval);