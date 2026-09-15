const fs = require('fs');
const path = 'lib/auth.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `// Force NextAuth to trust the provided callback URL (avoids localhost:3000 redirects on Vercel)
      return url.startsWith("/") ? \`https://ericahlicious.vercel.app\${url}\` : url;`,
  `// Force NextAuth to trust the provided callback URL (avoids localhost:3000 redirects on Vercel)
      if (url.startsWith("/")) {
        return process.env.NODE_ENV === "development" ? \`http://localhost:3000\${url}\` : \`https://ericahlicious.vercel.app\${url}\`;
      }
      return url;`
);
fs.writeFileSync(path, code);
console.log('Fixed for local dev');
