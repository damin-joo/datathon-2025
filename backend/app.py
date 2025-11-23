# This is a Flask application that serves as an API endpoint for querying data from Google BigQuery.

# Import necessary libraries
import os
from flask import Flask, jsonify
from flask_cors import CORS
from google.cloud import bigquery

# Import route blueprints
from routes.user import user_bp
from routes.scoring import scoring_bp
from routes.ranking import ranking_bp
from routes.goals import goals_bp


# Initialize the Flask-CORS app
app = Flask(__name__)
CORS(app)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "keys/service-account.json"

# Define API endpoint for BigQuery
bq_client = bigquery.Client()       # init BigQuery client
@app.route("/api/bq-test")
def bigquery_test():
    query = """
        SELECT name, gender
        FROM `bigquery-public-data.usa_names.usa_1910_current`
        LIMIT 20
    """
    rows = bq_client.query(query).result()
    return {"data": [dict(r) for r in rows]}

#Register API Blueprints
app.register_blueprint(user_bp, url_prefix="/api")
app.register_blueprint(scoring_bp, url_prefix="/api")
app.register_blueprint(ranking_bp, url_prefix="/api")
app.register_blueprint(goals_bp, url_prefix="/api")

# Health Check Endpoint
@app.route("/api/health")
def health():
    return {"status": "OK", "bigquery": "connected"}

API_ENDPOINT = "https://www.cbsa-asfc.gc.ca/eservices/api/er-tc-openapi.json"

@app.route("/api/get-currency")
def get_currency():
    currency_query = """
            SELECT Rate 
            FROM ''
            LIMIT 10
            """

def get_usd_to_cad_rate():
    try:
        app.logger.info("")

        max_retries = 3
        response = None

        for attempt in range(max_retries):
            response = requests.get(API_ENDPOINT, timeouit=10)

            # Check for a successful response (HTTP 200)
            if response.status_code == 200:
                break
            
            # If request fails, wait and retry (exponential backoff)
            app.logger.warning(f"API call failed with status code {response.status_code}. Retrying in {2**attempt} seconds...")
            if attempt < max_retries - 1:
                time.sleep(2**attempt)
            else:
                # If all retries fail, raise the exception for the outer try/except
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
        app.logger.error(f"Network or HTTP request failed. Could not reach the API: {e}", exc_info=True)
        return None, None
    except (KeyError, ValueError, IndexError) as e:
        app.logger.error(f"Failed to parse API response data (unexpected structure): {e}", exc_info=True)
        return None, None
    except Exception as e:
        app.logger.error(f"An unexpected error occurred: {e}", exc_info=True)
        return None, None


# Currency Conversion Endpoint (USD to CAD)
@app.route("/api/exchange/usd-to-cad")
def usd_to_cad():
    """
    Fetches and returns the exchange rate from USD to CAD from the live CBSA API.
    """
    exchange_rate, rate_date = get_usd_to_cad_rate()

    if exchange_rate is None:
        return jsonify({
            "error": "Failed to retrieve live exchange rate.", 
            "message": "The external CBSA API could not be reached or returned invalid data."
        }), 503 # Service Unavailable
    
    response = {
        "source": "USD",
        "target": "CAD",
        "rate": exchange_rate,
        "date": rate_date,
        "timestamp": datetime.now().isoformat(),
        "disclaimer": "This rate is sourced live from the Canada Border Services Agency (CBSA) API."
    }
    return jsonify(response)

# Main application entry point
if __name__ == "__main__":
    app.run(port=5000, debug=True)