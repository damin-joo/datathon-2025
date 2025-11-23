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

# Main application entry point
if __name__ == "__main__":
    app.run(port=5000, debug=True)