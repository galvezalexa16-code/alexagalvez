const fs = require('fs');
const path = 'lib/auth.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('async redirect(')) {
  code = code.replace(
    'callbacks: {',
    `callbacks: {
    async redirect({ url, baseUrl }) {
      // Force NextAuth to trust the provided callback URL (avoids localhost:3000 redirects on Vercel)
      return url.startsWith("/") ? \`https://ericahlicious.vercel.app\${url}\` : url;
    },`
  );
  fs.writeFileSync(path, code);
  console.log('authOptions updated with custom redirect callback');
}
