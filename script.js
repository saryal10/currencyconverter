document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn');
    const resultParagraph = document.getElementById('result');

    // Replace with your actual API key from ExchangeRate-API.com
    const API_KEY = '9c3d89c169bab95071672045';
    const API_BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

    let exchangeRates = {}; // To store fetched exchange rates

    // Function to populate currency dropdowns
    async function populateCurrencies() {
        try {
            const response = await fetch(`${API_BASE_URL}/latest/USD`); // Fetching from USD as a base to get all currency codes
            const data = await response.json();

            if (data.result === 'success') {
                const currencies = Object.keys(data.conversion_rates).sort();

                currencies.forEach(currency => {
                    const option1 = document.createElement('option');
                    option1.value = currency;
                    option1.textContent = currency;
                    fromCurrencySelect.appendChild(option1);

                    const option2 = document.createElement('option');
                    option2.value = currency;
                    option2.textContent = currency;
                    toCurrencySelect.appendChild(option2);
                });

                // Set default selections
                fromCurrencySelect.value = 'USD';
                toCurrencySelect.value = 'EUR';

                // Initial fetch for rates
                fetchRates(fromCurrencySelect.value);

            } else {
                resultParagraph.textContent = `Error fetching currencies: ${data['error-type'] || 'Unknown error'}`;
            }
        } catch (error) {
            console.error('Error fetching currency list:', error);
            resultParagraph.textContent = 'Failed to load currency list. Please check your internet connection or API key.';
        }
    }

    // Function to fetch exchange rates for a given base currency
    async function fetchRates(baseCurrency) {
        try {
            const response = await fetch(`${API_BASE_URL}/latest/${baseCurrency}`);
            const data = await response.json();

            if (data.result === 'success') {
                exchangeRates = data.conversion_rates;
                resultParagraph.textContent = ''; // Clear previous errors
            } else {
                resultParagraph.textContent = `Error fetching rates: ${data['error-type'] || 'Unknown error'}`;
                exchangeRates = {}; // Clear rates on error
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            resultParagraph.textContent = 'Failed to fetch exchange rates. Please try again.';
            exchangeRates = {};
        }
    }

    // Function to perform the conversion
    function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount) || amount <= 0) {
            resultParagraph.textContent = 'Please enter a valid amount.';
            return;
        }

        if (Object.keys(exchangeRates).length === 0) {
            resultParagraph.textContent = 'Exchange rates not loaded. Please try again or check API key.';
            return;
        }

        if (fromCurrency === toCurrency) {
            resultParagraph.textContent = `${amount.toFixed(2)} ${fromCurrency} = ${amount.toFixed(2)} ${toCurrency}`;
            return;
        }

        const rateTo = exchangeRates[toCurrency];

        if (rateTo) {
            const convertedAmount = amount * rateTo;
            resultParagraph.textContent = `${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        } else {
            resultParagraph.textContent = `Could not find conversion rate for ${toCurrency}.`;
        }
    }

    // Event Listeners
    fromCurrencySelect.addEventListener('change', (event) => {
        fetchRates(event.target.value); // Fetch new rates when "From" currency changes
        resultParagraph.textContent = ''; // Clear result
    });

    convertBtn.addEventListener('click', convertCurrency);

    // Initial setup
    populateCurrencies();
});
