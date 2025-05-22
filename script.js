document.addEventListener('DOMContentLoaded', () => {
    const baseRateParagraph = document.getElementById('baseRate');
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn'); // Keep if you want the button, otherwise remove
    const resultParagraph = document.getElementById('result');
    const swapCurrenciesBtn = document.getElementById('swapCurrenciesBtn'); // Get the new swap button
    const loadingIndicator = document.getElementById('loadingIndicator'); // Get the loading indicator

    const API_KEY = '9c3d89c169bab95071672045'; // Your key here
    const API_BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

    let exchangeRates = {}; // To store fetched exchange rates

    // Function to show/hide loading indicator
    function showLoading() {
        loadingIndicator.classList.remove('hidden');
        resultParagraph.textContent = ''; // Clear result while loading
    }

    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }

    // Function to populate currency dropdowns
    async function populateCurrencies() {
        showLoading(); // Show loading indicator
        console.log("Populating currencies...");
        try {
            const response = await fetch(`${API_BASE_URL}/latest/USD`);
            const data = await response.json();
            console.log("Currency list API response:", data);

            if (data.result === 'success') {
                const currencies = Object.keys(data.conversion_rates).sort();

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
                toCurrencySelect.value = 'NEP';

                console.log("Currencies populated successfully.");
                // Initial fetch for rates for the default "From" currency
                await fetchRates(fromCurrencySelect.value); // Use await here
                convertCurrency(); // Perform initial conversion
                hideLoading(); // Hide loading indicator after initial fetch and conversion

            } else {
                resultParagraph.textContent = `Error fetching currencies: ${data['error-type'] || 'Unknown error'}`;
                console.error("API error fetching currencies:", data['error-type'] || 'Unknown error in API response');
                hideLoading(); // Hide loading indicator on error
            }
        } catch (error) {
            console.error('Error fetching currency list (populateCurrencies):', error);
            resultParagraph.textContent = 'Failed to load currency list. Please check your internet connection or API key.';
            hideLoading(); // Hide loading indicator on error
        }
    }

    // Function to fetch exchange rates for a given base currency
    async function fetchRates(baseCurrency) {
        showLoading(); // Show loading indicator
        console.log(`Workspaceing rates for base: ${baseCurrency}...`);
        try {
            const response = await fetch(`${API_BASE_URL}/latest/${baseCurrency}`);
            const data = await response.json();
            console.log(`Exchange rates API response for ${baseCurrency}:`, data);

            if (data.result === 'success') {
                exchangeRates = data.conversion_rates;
                console.log('Exchange rates fetched:', exchangeRates);
                resultParagraph.textContent = ''; // Clear previous errors
                updateBaseRateDisplay(); // Update the base rate display after rates are fetched
                convertCurrency(); // Perform conversion after new rates are loaded
                hideLoading(); // Hide loading indicator
            } else {
                resultParagraph.textContent = `Error fetching rates: ${data['error-type'] || 'Unknown error'}`;
                exchangeRates = {}; // Clear rates on error
                baseRateParagraph.textContent = ''; // Clear base rate display on error
                console.error(`API error fetching rates for ${baseCurrency}:`, data['error-type'] || 'Unknown error in API response');
                hideLoading(); // Hide loading indicator on error
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            resultParagraph.textContent = 'Failed to fetch exchange rates. Please try again.';
            exchangeRates = {};
            baseRateParagraph.textContent = ''; // Clear base rate display on error
            hideLoading(); // Hide loading indicator on error
        }
    }

    // Function to update the base rate display
    function updateBaseRateDisplay() {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        console.log(`Attempting to update base rate display. From: ${fromCurrency}, To: ${toCurrency}`);

        if (Object.keys(exchangeRates).length > 0 && exchangeRates[toCurrency]) {
            const rate = exchangeRates[toCurrency];
            baseRateParagraph.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
            console.log(`Base rate displayed: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`);
        } else {
            baseRateParagraph.textContent = 'Select currencies to see base rate.';
            console.log('Base rate not available yet or selected "To" currency not found in rates.', {exchangeRates, toCurrency});
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

    // Event Listeners for Real-time Conversion
    amountInput.addEventListener('input', convertCurrency); // Convert on amount change
    toCurrencySelect.addEventListener('change', updateBaseRateDisplay); // Still update base rate when 'to' currency changes

    // Modified fromCurrencySelect listener to ensure conversion after new rates
    fromCurrencySelect.addEventListener('change', async (event) => {
        console.log('From currency changed to:', event.target.value);
        await fetchRates(event.target.value); // Wait for rates to be fetched
        // convertCurrency is called inside fetchRates now, so no need here
        resultParagraph.textContent = ''; // Clear result just before new conversion
    });

    // Swap Currencies Button Event Listener
    swapCurrenciesBtn.addEventListener('click', async () => {
        const currentFrom = fromCurrencySelect.value;
        const currentTo = toCurrencySelect.value;

        fromCurrencySelect.value = currentTo;
        toCurrencySelect.value = currentFrom;

        // Fetch new rates based on the new 'from' currency and then convert
        await fetchRates(fromCurrencySelect.value);
        updateBaseRateDisplay(); // Update base rate display for the swapped currencies
        convertCurrency(); // Perform conversion after swap
        console.log('Currencies swapped.');
    });

    // Initial setup
    populateCurrencies();
    console.log('Script initialized.');
});
