import fs from "fs";
import path from "path";
import { exec } from "child_process";


import { execSync } from "child_process";

const SANDBOX_ROOT = path.join(process.cwd(), "sandbox");

export class PreviewService {
  
  static async buildAndServe(projectId, code) {
    const projectPath = path.join(SANDBOX_ROOT, projectId.toString());
    
    // Create project structure
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    // Write HTML file
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

    fs.writeFileSync(
      path.join(projectPath, "index.html"),
      htmlContent
    );

    return `/preview/${projectId}`;
  }
}



let CURRENT_PORT = 5173; // Vite ka default start

export function getNextPort() {
  CURRENT_PORT += 1;
  return CURRENT_PORT;
}
