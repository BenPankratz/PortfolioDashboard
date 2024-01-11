import yfinance as yf
import requests 
api_key = 'HXRG2dCg2Ha9RraPXJ0bO3cpXo7i7zbT'
def get_current_prices(tickers, api_key):
    
    FMP_URL = "https://financialmodelingprep.com/api/v3/quote"
    prices = {}

    for ticker in tickers:
        response = requests.get(f"{FMP_URL}/{ticker}?apikey={api_key}")
        if response.status_code == 200:
            data = response.json()
            if data:
                price = data[0]['price']
                prices[ticker] = price
            else:
                print(f"No data returned for {ticker}.")
        else:
            print(f"Request failed with status code {response.status_code} for {ticker}.")

    return prices


# Example usage:
tickers = ['AAPL', 'GOOG', 'MSFT']
current_prices = get_current_prices(tickers, api_key)
print(current_prices)

