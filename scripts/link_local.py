import os
import re
import json
import urllib.request

# 1. Path definitions
DASHBOARD_PATH = 'public/dashboard.html'
DATA_DIR = 'public/data'
DUMMY_JS_PATH = os.path.join(DATA_DIR, 'dummy_data.js')

# 2. Create data directory if not exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)
    print(f"Created directory: {DATA_DIR}")

# 3. Fetch live data from Google Sheets
print("Fetching live data from Google Sheets...")
try:
    # Read GAS_API_URL from dashboard.html
    with open(DASHBOARD_PATH, 'r') as f:
        content = f.read()
        match = re.search(r'const GAS_API_URL = "(https://script\.google\.com/macros/s/[^"]+/exec)"', content)
        if match:
            gas_url = match.group(1)
            print(f"Found API URL: {gas_url[:50]}...")
            
            # Fetch the data
            with urllib.request.urlopen(gas_url) as response:
                data = json.loads(response.read().decode())
                if isinstance(data, list):
                    print(f"Successfully fetched {len(data)} records.")
                    # Use the fetched data
                    js_content = f"const LOCAL_DUMMY_DATA = {json.dumps(data, indent=2)};\n"
                else:
                    print("Received data is not a list. Using fallback.")
                    js_content = "const LOCAL_DUMMY_DATA = [];\n"
        else:
            print("Could not find GAS_API_URL in dashboard.html. Using empty fallback.")
            js_content = "const LOCAL_DUMMY_DATA = [];\n"
except Exception as e:
    print(f"Error fetching data: {e}")
    print("Linking to empty local data.")
    js_content = "const LOCAL_DUMMY_DATA = [];\n"

# 4. Save dummy_data.js
with open(DUMMY_JS_PATH, 'w') as f:
    f.write(js_content)
print(f"Generated: {DUMMY_JS_PATH}")

# 5. Inject logic into dashboard.html (if not already there)
with open(DASHBOARD_PATH, 'r') as f:
    html = f.read()

# Add script tag for dummy data
if 'data/dummy_data.js' not in html:
    html = html.replace('</head>', '  <script src="data/dummy_data.js"></script>\n</head>')
    print("Injected script tag into dashboard.html")

# Modify loadFromAPI to check for local data first
local_logic = """
    async function loadFromAPI() {
      // Check for Local Dummy Data first (Link Local)
      if (typeof LOCAL_DUMMY_DATA !== 'undefined' && LOCAL_DUMMY_DATA.length > 0) {
        console.log("Link Local: Using data from dummy_data.js");
        allData = mapAPIData(LOCAL_DUMMY_DATA);
        saveData();
        renderTable();
        renderDashboard();
        populateFilters();
        showToast("Link Local Aktif: Menggunakan data dari spreadsheet yang di-cache lokal.", "success");
        return;
      }
"""

if 'if (typeof LOCAL_DUMMY_DATA !== \'undefined\')' not in html:
    html = html.replace('async function loadFromAPI() {', local_logic)
    print("Injected local loading logic into dashboard.html")

with open(DASHBOARD_PATH, 'w') as f:
    f.write(html)

print("✅ Dashboard linked to local (cached) spreadsheet data successfully!")
