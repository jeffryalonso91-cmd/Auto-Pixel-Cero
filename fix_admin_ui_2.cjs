const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf-8');

code = code.replace(/tempConfig\.storeName/g, 'tempConfig?.storeName');
code = code.replace(/tempConfig\.whatsappNumber/g, 'tempConfig?.whatsappNumber');
code = code.replace(/tempConfig\.email/g, 'tempConfig?.email');
code = code.replace(/tempConfig\.instagramUrl/g, 'tempConfig?.instagramUrl');
code = code.replace(/tempConfig\.businessHours/g, 'tempConfig?.businessHours');
code = code.replace(/tempConfig\.currencySymbol/g, 'tempConfig?.currencySymbol');

fs.writeFileSync('src/components/Admin.tsx', code);
