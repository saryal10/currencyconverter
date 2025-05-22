document.addEventListener('DOMContentLoaded', () => {
  const baseRateParagraph = document.getElementById('baseRate');
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn');
    const resultParagraph = document.getElementById('result');
    // Get the pre-existing paragraph element for base rate
    const baseRateParagraph = document.getElementById('baseRate'); // THIS ASSUMES <p id="baseRate"></p> IS IN YOUR HTML

    // IMPORTANT: Replace with your actual API key from ExchangeRate-API.com
    const API_KEY = '9c3d89c169bab95071672045'; // Your key here
    const API_BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

    let exchangeRates = {}; // To store fetched exchange rates

    // Function to populate currency dropdowns
    async function populateCurrencies() {
        console.log("Populating currencies..."); // Debugging log
        try {
            const response = await fetch(`${API_BASE_URL}/latest/USD`); // Fetching from USD as a base to get all currency codes
            const data = await response.json();
            console.log("Currency list API response:", data); // Debugging log

            if (data.result === 'success') {
                const currencies = Object.keys(data.conversion_rates).sort();

                // Clear existing options to prevent duplicates on re-run (e.g., during development)
                fromCurrencySelect.innerHTML = '';
                toCurrencySelect.innerHTML = '';

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

                console.log("Currencies populated successfully."); // Debugging log
                // Initial fetch for rates for the default "From" currency
                fetchRates(fromCurrencySelect.value);

            } else {
                resultParagraph.textContent = `Error fetching currencies: ${data['error-type'] || 'Unknown error'}`;
                console.error("API error fetching currencies:", data['error-type'] || 'Unknown error in API response'); // Debugging error
            }
        } catch (error) {
            console.error('Error fetching currency list (populateCurrencies):', error); // Debugging error
            resultParagraph.textContent = 'Failed to load currency list. Please check your internet connection or API key.';
        }
    }

    // Function to fetch exchange rates for a given base currency
    async function fetchRates(baseCurrency) {
        console.log(`Fetching rates for base: ${baseCurrency}...`); // Debugging log
        try {
            const response = await fetch(`${API_BASE_URL}/latest/${baseCurrency}`);
            const data = await response.json();
            console.log(`Exchange rates API response for ${baseCurrency}:`, data); // Debugging log

            if (data.result === 'success') {
                exchangeRates = data.conversion_rates;
                console.log('Exchange rates fetched:', exchangeRates); // Debugging log
                resultParagraph.textContent = ''; // Clear previous errors
                updateBaseRateDisplay(); // Update the base rate display after rates are fetched
            } else {
                resultParagraph.textContent = `Error fetching rates: ${data['error-type'] || 'Unknown error'}`;
                exchangeRates = {}; // Clear rates on error
                baseRateParagraph.textContent = ''; // Clear base rate display on error
                console.error(`API error fetching rates for ${baseCurrency}:`, data['error-type'] || 'Unknown error in API response'); // Debugging error
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error); // Debugging error
            resultParagraph.textContent = 'Failed to fetch exchange rates. Please try again.';
            exchangeRates = {};
            baseRateParagraph.textContent = ''; // Clear base rate display on error
        }
    }

    // Function to update the base rate display
    function updateBaseRateDisplay() {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        console.log(`Attempting to update base rate display. From: ${fromCurrency}, To: ${toCurrency}`); // Debugging log

        // Ensure exchangeRates is populated and 'toCurrency' exists in it
        if (Object.keys(exchangeRates).length > 0 && exchangeRates[toCurrency]) {
            const rate = exchangeRates[toCurrency];
            baseRateParagraph.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
            console.log(`Base rate displayed: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`); // Debugging log
        } else {
            baseRateParagraph.textContent = 'Select currencies to see base rate.'; // Or leave empty
            console.log('Base rate not available yet or selected "To" currency not found in rates.', {exchangeRates, toCurrency}); // Debugging log
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
        console.log('From currency changed to:', event.target.value); // Debugging log
        fetchRates(event.target.value); // Fetch new rates when "From" currency changes
        resultParagraph.textContent = ''; // Clear result
    });

    // Also update base rate when 'to' currency changes (without refetching all rates)
    toCurrencySelect.addEventListener('change', () => {
        console.log('To currency changed.'); // Debugging log
        updateBaseRateDisplay(); // Update base rate when "To" currency changes
    });

    convertBtn.addEventListener('click', convertCurrency);

    // Initial setup
    populateCurrencies();
    console.log('Script initialized.'); // Debugging log
});
