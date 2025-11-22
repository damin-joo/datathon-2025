# This is a Flask application that serves as an API endpoint for querying data from Google BigQuery.

# Import necessary libraries
import os
from flask import Flask, jsonify
from flask_cors import CORS
from google.cloud import bigquery

# Initialize the Flask-CORS app
app = Flask(__name__)
CORS(app)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "keys/service-account.json"

# Define API endpoint for BigQuery
@app.route("/api/bq")
def bigquery_test():
    client = bigquery.Client()
    query = """
        SELECT name, gender
        FROM `bigquery-public-data.usa_names.usa_1910_current`
        LIMIT 100
        """
    rows = client.query(query).result()

    return {"data": [dict(r) for r in rows]}


# Main application entry point
if __name__ == "__main__":
    app.run(port=5000, debug=True)