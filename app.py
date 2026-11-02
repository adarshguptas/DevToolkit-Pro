from flask import Flask, jsonify, render_template
from pathlib import Path

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["JSON_SORT_KEYS"] = False

@app.get("/")
def index():
    return render_template("index.html")

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "DevToolkit Pro", "version": "1.0.0"})

@app.errorhandler(404)
def not_found(_error):
    if _error.name == "Not Found":
        return jsonify({"error": "Not found"}), 404
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
