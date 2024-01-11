import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import Plot from 'react-plotly.js';
import './PortfolioAnalyzer.css';

function PortfolioAnalyzer() {
    // State to store input values and results
    const [startDate, setStartDate] = useState('');
    // const [endDate, setEndDate] = useState('');
    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const year = today.getFullYear();
        return `${year}-${month}-${day}`; // Returns date in YYYY-MM-DD format
    });
    const [currentInput, setCurrentInput] = useState({ ticker: '', shares: '' })
    const [results, setResults] = useState({
        total_value: 0,
        breakdown: [],
        individual_returns: {} // Initialize individual_returns as an empty object
      });
    const [isCalculated, setIsCalculated] = useState(false);
    const [portfolio, setPortfolio] = useState([]);
    const samplePieChartData = {
        labels: ['AAPL', 'NVDA', 'AMZN', 'GOOG'],
        datasets: [
          {
            data: [25, 25, 25, 25],
            backgroundColor: [
              '#4169E1', // Royal blue
              '#6A5ACD', // Slate blue
              '#48D1CC', // Medium turquoise
              '#3CB371', // Medium sea green
            ],
          },
        ],
      };
    const pieChartColors = [
        '#0000FF', // Blue
        '#0099FF', // Blue Green
        '#00CCFF', // Deep Sky Blue
        '#00FFFF', // Sky Blue
        '#7FFFD4', // Aquamarine
        '#AFEEEE', // Pale Turquoise
        '#00FA9A', // Medium Spring Green
        '#00FF7F', // Spring Green
        '#90EE90', // Light Green
        '#008000'  // Green
      ];
      const [pieChartData, setPieChartData] = useState(samplePieChartData);
      
      async function updatePortfolioValue(newPortfolio) {
        const payload = {
          inputs: newPortfolio
        };
      
        try {
          console.log("Sending payload to backend for portfolio value:", payload);
          const response = await fetch('http://localhost:5000/api/portfolio_value', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          const data = await response.json();
          console.log("Received portfolio value data from backend:", data);
          setResults(data); // This will save the total portfolio value and breakdown to state
        } catch (error) {
          console.error('Error:', error);
          // Handle the error appropriately
        }
      }
      
      async function updatePieChartData(newPortfolio) {
        // Preparing the payload for the API request
        const payload = {
            inputs: newPortfolio // The current portfolio
            // start_date: startDate, // Start date, can be adjusted as per your requirements
            // end_date: endDate // End date, can be adjusted as per your requirements
        };
    
        try {
            console.log("Sending payload to backend:", payload);
            const response = await fetch('http://localhost:5000/api/update_portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            if (data.allocations && Object.keys(data.allocations).length > 0) {
                setIsCalculated(true); // Set to true when we have allocations
              }
            console.log("Received data from backend:", data);
            // Assuming the response contains allocations in the format: {ticker: allocation_percentage, ...}
            setPieChartData({
                labels: Object.keys(data.allocations),
                datasets: [
                    {
                        data: Object.values(data.allocations),
                        backgroundColor: pieChartColors, // This can be adjusted or dynamically generated
                    }
                ]
            });
        } catch (error) {
            console.error('Error:', error);
            // Handle the error appropriately
        }
    }

    const handleInputChange = (type, value) => {
        setCurrentInput({ ...currentInput, [type]: value });
        console.log(`Input change - ${type}: `, value);
    };

    const addInputPair = () => {
        // Ensure that both ticker and shares have valid inputs before adding
        if (currentInput.ticker && currentInput.shares && !isNaN(currentInput.shares)) {
          console.log("Adding to portfolio:", currentInput);
          const newPortfolio = [...portfolio, { ...currentInput }];
          setPortfolio(newPortfolio);
          updatePieChartData(newPortfolio);
          updatePortfolioValue(newPortfolio);
          setCurrentInput({ ticker: '', shares: '' }); // Reset input fields
        } else {
          // Handle the error, e.g., show an alert or set an error state
          console.error('Invalid input for ticker or shares');
        }
      };
      

      const removeInputPair = (indexToRemove) => {
        setPortfolio(currentPortfolio => {
          const newPortfolio = currentPortfolio.filter((_, index) => index !== indexToRemove);
          if (newPortfolio.length === 0) {
            setIsCalculated(false); // Reset to false when the portfolio is empty
            setPieChartData(samplePieChartData); // Reset to the sample chart data
          } else {
            updatePieChartData(newPortfolio); // Update pie chart with the new portfolio
            updatePortfolioValue(newPortfolio); // Update portfolio values with the new portfolio
          }
          return newPortfolio;
        });
      };
      

    return (
        <div className="portfolio-analyzer">
            <h1 className="main-title">Portfolio Analyzer</h1> {/* Main title for the website */}
            <div className="input-section-container">
                <div className="inputs">
                    <h2 className="section-header">Add Assets to Portfolio:</h2>
                        <div className="input-row">
                            <input
                                type="text"
                                value={currentInput.ticker}
                                placeholder="Ticker"
                                onChange={(e) => handleInputChange('ticker', e.target.value)}
                            />
                            <input
                                type="number"
                                value={currentInput.shares}
                                placeholder="Shares"
                                onChange={(e) => handleInputChange('shares', e.target.value)}
                            />
                        </div>
                    <button onClick={addInputPair} className="add-button">Add </button>

                    <div className="portfolio-value-container">
                    <h1> Your Portfolio:</h1>
                        <h2>Total Assets (USD): ${results.total_value.toFixed(2)}</h2>
                        <div className="portfolio-breakdown">
                        {results.breakdown.map((item, index) => (
                            <div key={index} className="portfolio-item">
                                <span>{item.ticker}: {item.shares} shares - ${item.value.toFixed(2)}</span>
                                <button onClick={() => removeInputPair(index)} className="remove-button">&#10006;</button>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
                <div className="chart-container">
                    <h3 className="chart=header">{isCalculated ? "Portfolio Makeup" : "Example Portfolio"}</h3>
                    <Pie data={results ? pieChartData : samplePieChartData} className="portfolio-makeup" />
                </div>
            </div>


        </div>
    );
}

export default PortfolioAnalyzer;



