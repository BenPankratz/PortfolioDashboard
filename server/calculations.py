import yfinance as yf
import pandas as pd
from datetime import datetime
import requests


def get_current_prices(tickers, api_key):
    FMP_API_URL = "https://financialmodelingprep.com/api/v3/quote"
    prices = {}
    # FMP allows multiple tickers separated by commas
    tickers_string = ','.join(tickers)
    response = requests.get(f"{FMP_API_URL}/{tickers_string}?apikey={api_key}")
    if response.status_code == 200:
        data = response.json()
        for item in data:
            symbol = item['symbol']
            price = item['price']
            prices[symbol] = price
    else:
        raise Exception(f"Error fetching data from FMP: {response.status_code}")
    print(prices)
    return prices

def calculate_allocations(tickers, shares, api_key):
    try:
        current_prices = get_current_prices(tickers, api_key)
        total_value = sum(current_prices[ticker] * share for ticker, share in zip(tickers, shares))
        allocations = {ticker: (current_prices[ticker] * share) / total_value * 100 for ticker, share in zip(tickers, shares)}
        return allocations
    except Exception as e:
        print(f"An error occurred: {e}")
        raise


def calculate_individual_values(tickers, shares, prices):
    individual_values = {ticker: prices[ticker] * shares[i] for i, ticker in enumerate(tickers)}
    return individual_values








def calculate_individual_returns(tickers, start_date, end_date):
    # end_date = datetime.now().strftime('%Y-%m-%d')  # Current date
    stock_data = yf.download(tickers, start=start_date, end=end_date)['Close']
    results = {}
    for i, ticker in enumerate(tickers):
        start_price = stock_data[ticker].iloc[0]
        current_price = stock_data[ticker].iloc[-1]
        return_pct = (current_price - start_price) / start_price * 100

        # Store the return percentage and allocation for each ticker
        results[ticker] = return_pct

    return results

def calculate_total_returns(individual_results, allocations):
    if len(individual_results) != len(allocations):
        raise ValueError("The number of allocations must match the number of stocks.")

    total_return = 0
    for i, ticker in enumerate(individual_results.keys()):
        return_pct = individual_results[ticker]
        weighted_return = return_pct * (allocations[i] / 100)
        total_return += weighted_return

    return total_return

