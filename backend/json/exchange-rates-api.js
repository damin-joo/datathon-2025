// 1. Define the Endpoint
const API_ENDPOINT = "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json";
const API_PROMPT = "GET https://bcd-api-dca-ipa.cbsa-asfc.cloud-nuage.canada.ca/exchange-rate-lambda/exchange-rates";
const todayDate = formatDate(new Date());
const yesterdayDate = getYesterdayDate();


// 2. Start the function to make the request
async function getConversionResult(usdAmount) {
    // 
    const statusMessage = document.getElementById('statusMessage');
    const resultsContainer = document.getElementById('resultsContainer');
    const apiUrlOutput = document.getElementById('apiUrlOutput');
    const ratesOutput = document.getElementById('ratesOutput');

    // 1. Construct the API URL with dynamic dates
    const apiUrl = `${API_PROMPT}?startDate=${yesterdayDate}&endDate=${todayDate}&limit=10&skip=2`;

}

// 3. Get yesterday's date
function getYesterdayDate() {
            const today = new Date();
            const yesterday = new Date(today);
            // Set the date back one day. This handles month/year rollovers automatically.
            yesterday.setDate(today.getDate() - 1);
            return formatDate(yesterday);
        }

// 4. Get today's date
function formatDate(date) {
            const year = date.getFullYear();
            // getMonth() is 0-indexed, so add 1
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

