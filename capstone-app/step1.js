const fs = require('fs');

// 1. Update types/index.ts
let typesCode = fs.readFileSync('types/index.ts', 'utf8');
if (!typesCode.includes('Menu Availability')) {
  typesCode = typesCode.replace(
    '  { label: "Reports", href: "/dashboard/reports", icon: "BarChart3", roles: ["OWNER", "ADMIN", "SUPERVISOR"] },\n];',
    '  { label: "Reports", href: "/dashboard/reports", icon: "BarChart3", roles: ["OWNER", "ADMIN", "SUPERVISOR"] },\n  { label: "Menu Availability", href: "/dashboard/menu-availability", icon: "ListChecks", roles: ["OWNER", "SUPERVISOR"] },\n];'
  );
  fs.writeFileSync('types/index.ts', typesCode);
  console.log('Updated types/index.ts');
}

// 2. Update Sidebar.tsx
let sidebarCode = fs.readFileSync('components/staff/layout/Sidebar.tsx', 'utf8');
if (!sidebarCode.includes('ListChecks')) {
  sidebarCode = sidebarCode.replace(
    '  BarChart3,\n  LogOut,\n} from "lucide-react";',
    '  BarChart3,\n  ListChecks,\n  LogOut,\n} from "lucide-react";'
  );
  sidebarCode = sidebarCode.replace(
    '  BarChart3,\n};\n\ninterface',
    '  BarChart3,\n  ListChecks,\n};\n\ninterface'
  );
  fs.writeFileSync('components/staff/layout/Sidebar.tsx', sidebarCode);
  console.log('Updated Sidebar.tsx');
}

