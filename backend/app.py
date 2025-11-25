import os
from flask import Flask
from flask_cors import CORS

from routes.scoring import scoring_bp
from routes.cad import cad_bp
from routes.goals import goals_bp
from routes.transaction import transaction_bp
from routes.coach import coach_bp

app = Flask(__name__)
app.secret_key = "local-dev-secret"   # safe for local

CORS(app, supports_credentials=True)

# Register routes
app.register_blueprint(scoring_bp, url_prefix="/api")
app.register_blueprint(cad_bp, url_prefix="/api")
app.register_blueprint(transaction_bp, url_prefix="/api")
app.register_blueprint(goals_bp, url_prefix="/api")
app.register_blueprint(coach_bp, url_prefix="/api")

@app.route("/api/health")
def health():
    return {"status": "OK", "storage": "local csv"}

if __name__ == "__main__":
    app.run(port=5000, debug=True)