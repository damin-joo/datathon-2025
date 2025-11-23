from flask import Blueprint, request, jsonify
import requests

cad_bp = Blueprint("cad", __name__)

API_PROMPT = "https://bcd-api-dca-ipa.cbsa-asfc.cloud-nuage.canada.ca/exchange-rate-lambda/exchange-rates"

@cad_bp.route("/convert", methods=["GET"])
def convert_usd_to_cad():
    usd_amount = float(request.args.get("usd_amount", 1))
    co2e_per_dollar = float(request.args.get("co2e_per_dollar", 0.2))

    try:
        response = requests.get(API_PROMPT)
        response.raise_for_status()
        data = response.json()

        fx_rates = data.get("ForeignExchangeRates", [])
        usd_to_cad_rate = 1

        for item in fx_rates:
            if item.get("FromCurrency", {}).get("Value") == "USD" and item.get("ToCurrency", {}).get("Value") == "CAD":
                usd_to_cad_rate = float(item["Rate"])
                break

        cad_amount = usd_amount * usd_to_cad_rate
        co2_per_canadian_dollar = co2e_per_dollar / usd_to_cad_rate

        return jsonify({
            "usd_amount": usd_amount,
            "cad_amount": round(cad_amount, 2),
            "usd_to_cad_rate": usd_to_cad_rate,
            "co2_per_canadian_dollar": round(co2_per_canadian_dollar, 4)
        })

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
    
# Output example:
# http://127.0.0.1:5000/api/convert?usd_amount=10&co2e_per_dollar=0.2
# {
#   "cad_amount": 14.1,
#   "co2_per_canadian_dollar": 0.1418,
#   "usd_amount": 10.0,
#   "usd_to_cad_rate": 1.41
# }