
DASHBOARD HTML MODIFICATIONS:
1. After "let lineChartInst, doughnutChartInst, barChartInst;" add the API code from _api_code.js
2. In doLogin(), after "initApp();" add "loadFromAPI();"
3. In loadFromSheet(), replace:
   const url = localStorage.getItem('gasUrl');
   with:
   const url = localStorage.getItem('gasUrl') || GAS_API_URL;
4. At the bottom, replace:
   document.getElementById('gasUrl').value = localStorage.getItem('gasUrl') || '';
   with:
   document.getElementById('gasUrl').value = localStorage.getItem('gasUrl') || GAS_API_URL;
