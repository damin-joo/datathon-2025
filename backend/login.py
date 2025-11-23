from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash

auth_bp = Blueprint("auth", __name__)

# Example user data
users = {
    "test@example.com": {"password": "pbkdf2:sha256:150000$ABC123$hashed_password_here"}
}

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users.get(email)
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid email or password"}), 401

    # Generate JWT token
    import jwt, datetime
    token = jwt.encode(
        {"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
        "YOUR_SECRET_KEY",
        algorithm="HS256"
    )

    return jsonify({"token": token})
