import requests
import json
import sys
from datetime import datetime
import time

# --- Configuration ---
# The amount in US Dollars (USD) the user wants to convert.
USD_AMOUNT = 2.00 

# The Bank of Canada (BoC) Valet API is the primary source for the CBSA exchange rates.
# FXUSDCAD is the series code for the U.S. dollar daily exchange rate (USD/CAD).
API_ENDPOINT = "https://www.cbsa-asfc.gc.ca/eservices/api/er-tc-openapi.json"

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

api_response = requests.get("https://www.cbsa-asfc.gc.ca/eservices/api/er-tc-openapi").json()

def jprint(obj):
    # create a formatted string of the Python JSON object
    text = json.dumps(obj, sort_keys=True, indent=4)
    print(text)

def get_usd_to_cad_rate():
    """
    Fetches the latest USD/CAD exchange rate from the Bank of Canada API.
    """
    try:
        print(f"Fetching daily exchange rate for USD/CAD...")
        
        max_retries = 3
        for attempt in range(max_retries):
            # Attempt to fetch the data
            response = requests.get(API_ENDPOINT, timeout=10)
            
            # Check for a successful response (HTTP 200)
            if response.status_code == 200:
                break
            
            # If request fails, wait and retry (exponential backoff)
            print(f"Warning: API call failed with status code {response.status_code}. Retrying in {2**attempt} seconds...")
            if attempt < max_retries - 1:
                time.sleep(2**attempt)
            else:
                # If all retries fail, raise the exception
                response.raise_for_status() 

        data = response.json()
        
        # The rates are under 'observations'. We take the last (latest) one.
        observations = data.get('observations', [])
        if not observations:
            raise ValueError("API response did not contain exchange rate observations.")
            
        latest_observation = observations[-1]
        
        # The rate value is stored under the 'FXUSDCAD' key, within the 'v' key
        rate_entry = latest_observation.get('FXUSDCAD')
        if not rate_entry or 'v' not in rate_entry:
            raise ValueError("Could not find the 'FXUSDCAD' rate key in the latest observation.")

        exchange_rate = float(rate_entry['v'])
        rate_date = latest_observation['d']
        
        return exchange_rate, rate_date

    except requests.exceptions.RequestException as e:
        print(f"\n[ERROR] Network or HTTP request failed. Could not reach the API: {e}", file=sys.stderr)
        return None, None
    except (KeyError, ValueError, IndexError) as e:
        print(f"\n[ERROR] Failed to parse API response data (unexpected structure): {e}", file=sys.stderr)
        return None, None
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred: {e}", file=sys.stderr)
        return None, None

def main():
    """
    Main function to run the conversion logic and display the result.
    """
    print(f"      {USD_AMOUNT:.2f} USD to CAD Converter")

    exchange_rate, rate_date = get_usd_to_cad_rate()

    if exchange_rate is None:
        # If API retrieval fails, stop execution or use a sensible fallback
        print("\nFATAL ERROR: Conversion rate could not be retrieved. Exiting.")
        return
        
    print(f"\n--- Exchange Rate Information ---")
    print(f"Source: Bank of Canada (CBSA Source)")
    print(f"Date of Rate: {rate_date}")
    print(f"Exchange Rate (USD/CAD): 1 USD = {exchange_rate:.4f} CAD")
    print("-" * 40)
    
    # Calculate the conversion
    cad_amount = USD_AMOUNT * exchange_rate
    
    # Display the final result
    print(f"Conversion Summary:")
    print(f"   Amount in USD: ${USD_AMOUNT:.2f}")
    print(f"   Amount in CAD: ${cad_amount:.2f}")
    print("-" * 40)

if __name__ == "__main__":
    main()