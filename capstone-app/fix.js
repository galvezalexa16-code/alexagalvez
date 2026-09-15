const fs = require('fs');
const path = require('path');

// 1. Fix UI layout issue by removing duplicate Sidebar from app/(staff)/layout.tsx
const layoutPath = 'app/(staff)/layout.tsx';
if (fs.existsSync(layoutPath)) {
  const layoutCode = `import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
`;
  fs.writeFileSync(layoutPath, layoutCode.trim() + '\n');
  console.log("Updated layout.tsx");
}

// 2. Fix signOut callback in Sidebar.tsx to avoid localhost:3000 redirect on Vercel
const sidebarPath = 'components/staff/layout/Sidebar.tsx';
if (fs.existsSync(sidebarPath)) {
  let sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
  sidebarCode = sidebarCode.replace(
    'signOut({ callbackUrl: "/login" })',
    'signOut({ callbackUrl: window.location.origin + "/login" })'
  );
  fs.writeFileSync(sidebarPath, sidebarCode);
  console.log("Updated Sidebar.tsx");
}

// 3. Global rename Ericahticos -> Ericahlicious
function replaceInFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.next') || fullPath.includes('.git')) continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInFiles(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.md'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (/ericahticos/i.test(content)) {
        content = content.replace(/ericahticos/g, 'ericahlicious');
        content = content.replace(/Ericahticos/g, 'Ericahlicious');
        fs.writeFileSync(fullPath, content);
        console.log('Renamed in:', fullPath);
      }
    }
  }
}

replaceInFiles('.');
