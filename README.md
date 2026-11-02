# DevToolkit Pro

A responsive, browser-based developer workspace built with **Python, Flask, HTML, CSS and vanilla JavaScript**. It bundles useful everyday utilities into one clean interface.

## Features

- **JSON Studio:** validate, pretty-print and minify JSON.
- **Base64:** Unicode-safe encode/decode.
- **URL Encoder:** encode/decode URL components.
- **Hash Generator:** SHA-256, SHA-384 and SHA-512 using Web Crypto.
- **UUID Generator:** create UUID v4 identifiers.
- **JWT Decoder:** inspect header and payload locally (does not verify signatures).
- **Regex Tester:** test JavaScript regular expressions.
- **API Tester:** send browser-based HTTP requests and inspect response status, body and duration.
- Responsive layout, dark/light theme, clipboard helpers and mobile navigation.
- Flask health endpoint and automated route tests.

## Tech stack

- Backend: Python 3.10+ and Flask
- Frontend: HTML5, CSS3 and vanilla JavaScript
- Tests: Python `unittest`
- Deployment: Gunicorn + Render

## Project structure

```text
devtoolkit-pro/
├── app.py
├── requirements.txt
├── Procfile
├── render.yaml
├── .gitignore
├── LICENSE
├── README.md
├── templates/
│   └── index.html
├── static/
│   ├── css/style.css
│   └── js/app.js
└── tests/
    └── test_app.py
```

## Run locally (Windows PowerShell)

```powershell
# 1. Open the project folder
cd path\to\devtoolkit-pro

# 2. Create a virtual environment
py -m venv .venv

# 3. Activate it
.\.venv\Scripts\Activate.ps1

# If PowerShell blocks activation, run this for the current terminal only:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# .\.venv\Scripts\Activate.ps1

# 4. Install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 5. Start the development server
python app.py
```

Open **http://127.0.0.1:5000** in your browser. Keep the terminal running while you use the site.

## Run tests

```powershell
python -m unittest discover -s tests -v
```

## Deploy to Render

1. Push this project to a GitHub repository.
2. Sign in to [Render](https://render.com/).
3. Choose **New + → Blueprint** and connect your GitHub repository.
4. Render reads `render.yaml`; review the service and deploy.
5. Open the generated `onrender.com` URL after deployment completes.

The free service may sleep after inactivity and take a little time to wake up. Check the Render dashboard for current plan limits.

## GitHub upload

Create an empty repository on GitHub named `devtoolkit-pro` (do not add a README or .gitignore there), then run these commands in the project directory:

```powershell
git init
git add .
git commit -m "Initial release: DevToolkit Pro"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/devtoolkit-pro.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Important notes

- The tools run locally in your browser wherever possible. Text for JSON, Base64, URL, hashes, UUIDs, JWT decoding and regex is not sent to the Flask backend.
- The API Tester calls the target API directly from the browser. Some APIs block cross-origin requests with **CORS**; this is a browser security restriction, not necessarily a bug in this project. Use an API that permits browser origins or configure the target API's CORS policy.
- JWT decoding is **not** JWT signature verification. Never treat decoded claims as trusted.
- Do not paste production secrets, private API keys, passwords or personal data into third-party services.
- Google Fonts are loaded remotely; the rest of the app is served by Flask.
