const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf-8');

code = code.replace(/value={tempConfig\.storeName}/g, 'value={tempConfig?.storeName || ""}');
code = code.replace(/value={tempConfig\.whatsappNumber}/g, 'value={tempConfig?.whatsappNumber || ""}');
code = code.replace(/value={tempConfig\.email}/g, 'value={tempConfig?.email || ""}');
code = code.replace(/value={tempConfig\.instagramUrl}/g, 'value={tempConfig?.instagramUrl || ""}');
code = code.replace(/value={tempConfig\.businessHours}/g, 'value={tempConfig?.businessHours || ""}');
code = code.replace(/tempConfig\.logoUrl/g, 'tempConfig?.logoUrl');
code = code.replace(/tempConfig\.heroImageUrl/g, 'tempConfig?.heroImageUrl');
code = code.replace(/tempConfig\.popupImageUrl/g, 'tempConfig?.popupImageUrl');
code = code.replace(/tempConfig\.popupEnabled/g, 'tempConfig?.popupEnabled');
code = code.replace(/setTempConfig\(\{\.\.\.tempConfig/g, 'setTempConfig({...(tempConfig || {})');
code = code.replace(/onClick=\{\(\) => setActiveTab\('config'\)\}/g, "onClick={() => { setActiveTab('config'); setTempConfig(storeConfig || {}); }}");

fs.writeFileSync('src/components/Admin.tsx', code);
