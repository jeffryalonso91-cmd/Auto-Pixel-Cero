const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = "import ErrorBoundary from './components/ErrorBoundary';\n" + code;
code = code.replace('<Admin ', '<ErrorBoundary><Admin ');
code = code.replace('setStoreConfig={setStoreConfig} />', 'setStoreConfig={setStoreConfig} /></ErrorBoundary>');
fs.writeFileSync('src/App.tsx', code);
