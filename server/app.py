# flask_backend/app.py
from calculations import *
from flask import Flask, jsonify, request
from flask_cors import CORS
import json

api_key = 'HXRG2dCg2Ha9RraPXJ0bO3cpXo7i7zbT'

app = Flask(__name__)
CORS(app)

@app.route('/api/update_portfolio', methods=['POST'])
def update_portfolio():
    data = request.json
    print("Received data for portfolio update:", data)
    if 'inputs' not in data or not data['inputs']:
        return jsonify({"error": "Missing portfolio data"}), 400

    try:
        inputs = data['inputs']
        tickers = [i.get('ticker') for i in inputs]
        shares = [float(i.get('shares')) for i in inputs]
        allocations = calculate_allocations(tickers, shares, api_key)
        print("Calculated allocations:", allocations)
        return jsonify(allocations=allocations)
    except Exception as e:
        print("An error occurred:", str(e))
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/portfolio_value', methods=['POST'])
def portfolio_value():
    data = request.json
    print("Received data for portfolio valuation:", data)
    if 'inputs' not in data or not data['inputs']:
        return jsonify({"error": "Missing portfolio data"}), 400

    try:
        inputs = data['inputs']
        tickers = [i.get('ticker') for i in inputs]
        shares = [float(i.get('shares')) for i in inputs]
        prices = get_current_prices(tickers, api_key)
        individual_values = calculate_individual_values(tickers, shares, prices)
        total_value = sum(individual_values.values())
        portfolio_details = {
            "total_value": total_value,
            "breakdown": [{"ticker": ticker, "shares": share, "value": value} 
                          for ticker, share, value in zip(tickers, shares, individual_values.values())]
        }
        return jsonify(portfolio_details)
    except Exception as e:
        print("An error occurred:", str(e))
        return jsonify({"error": str(e)}), 500





@app.route('/api/analyze', methods=['POST'])
def analyze_portfolio():
    # Extract data from request
    data = request.json  # Assuming data is sent in JSON format
    print('Received data:', data)
    inputs = data.get('inputs')  # This now contains a list of {ticker, allocation} objects
    print('Received inputs:', inputs)
    start_date = data.get('start_date')
    end_date = data.get('end_date') or datetime.now().strftime('%Y-%m-%d')
    if not inputs or not start_date:
        return jsonify({"error": "Missing data"}), 400

    tickers = [i.get('ticker') for i in inputs]
    shares = [float(i.get('shares'))for i in inputs]
    print(tickers)
    print(allocations)
    # For example:
    try: 
        allocations = calculate_allocations(tickers, shares)
        individual_results = calculate_individual_returns(tickers, start_date, end_date)
        total_return = calculate_total_returns(individual_results, allocations)
        # Create a response
        response = {
            'allocations': allocations,
            'individual_returns': individual_results,
            'total_return': total_return
        }
        print('response', response)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)