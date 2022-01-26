import fetch from 'node-fetch';
import CryptoJS from 'crypto-js';

const API_URL = 'https://api.iconomi.com'
const API_SECRET = '<YOUR_SECRET>'
const API_KEY = '<YOUR_KEY>'

export function getAssets() {
  get('/v1/assets')
}

export function getActivity() {
  get('/v1/user/activity?type=FEES_AND_EARNINGS')
}

export function getStructure(ticker) {
  get('/v1/strategies/' + ticker + '/structure')
}

export function setStructure(ticker) {
  var rebalance = {
    ticker: ticker,
    values: [
      {
        assetTicker: 'BTC',
        rebalancedWeight: 0.5,
      },
      {
        assetTicker: 'ETH',
        rebalancedWeight: 0.5,
      }
    ]
  }

  var api = '/v1/strategies/' + ticker + '/structure'
  var payload = JSON.stringify(rebalance)

  post(api, payload)  
}

export function get(api) {
  call('GET', api, '')
}

export function post(api, payload) {
  call('POST', api, payload)
}

export function call(method, api, payload) {
  var timestamp = new Date().getTime()
  var hashSign = generateSignature(payload, method, api, timestamp)

  var request = {
    'method': method,
    'headers': {
      'ICN-API-KEY': API_KEY,
      'ICN-SIGN': hashSign,
      'ICN-TIMESTAMP':timestamp,
      'Content-Type': 'application/json'
      }
  }

  if (method === 'POST') {
    request.body = payload
  }

  fetch(API_URL + api, request)
      .then( (httpResponse) => {
        if (httpResponse.ok) {
          return httpResponse.json();
        } else {
          console.log(httpResponse)
          return Promise.reject('Request did not succeed');
        }
      } )
      .then(json => console.log(json))
      .catch(err => console.log(err));
}

export function generateSignature(payload, requestType, requestPath, timestamp) {
  var index = requestPath.indexOf('?')
  if (index != -1) {
    requestPath = requestPath.substring(0, index)
  }

  var textToSign = timestamp + requestType + requestPath + payload
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA512(textToSign, API_SECRET))
}

// fetch all available assets
getAssets()

// fetch transactions
getActivity()

// fetch strategy details info
getStructure('<YOUR_TICKER>')

// change strategy structure !!! CAUTION ... YOU WILL PERFORM STUCTURE CHANGE (REBALANCE) !!!!
setStructure('<YOUR_TICKER>')