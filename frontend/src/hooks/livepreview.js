// frontend/src/hooks/livepreview.js

// ✅ Escape HTML for code preview
const escapeHtml = (text) => {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const getPreviewHTML = (code, fileName = 'App.jsx') => {
  if (!code) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Empty Preview</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
  </style>
</head>
<body>
  <div style="text-align: center; color: #64748b;">
    <svg style="width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
    </svg>
    <p style="font-size: 16px; font-weight: 500;">No code to preview</p>
  </div>
</body>
</html>
    `
  }

  const isMainApp = fileName === 'App.jsx' || fileName === 'src/App.jsx'
  
  // ✅ For non-App files, show syntax-highlighted code
  if (!isMainApp) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Preview - ${escapeHtml(fileName)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #0f172a;
      font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
    }
    .code-container {
      background: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      max-width: 1200px;
      margin: 0 auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .file-header {
      background: #334155;
      color: #e2e8f0;
      padding: 16px 20px;
      font-size: 14px;
      font-weight: 600;
      border-bottom: 1px solid #475569;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .code-wrapper {
      padding: 20px;
      overflow: auto;
      max-height: calc(100vh - 120px);
    }
    pre {
      margin: 0 !important;
      background: transparent !important;
      padding: 0 !important;
    }
    code {
      font-size: 14px !important;
      line-height: 1.6 !important;
      font-family: 'Fira Code', 'Monaco', 'Courier New', monospace !important;
    }
    .hljs {
      background: transparent !important;
    }
  </style>
</head>
<body>
  <div class="code-container">
    <div class="file-header">
      <span>📄</span>
      <span>${escapeHtml(fileName)}</span>
    </div>
    <div class="code-wrapper">
      <pre><code class="language-javascript">${escapeHtml(code)}</code></pre>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      hljs.highlightAll();
    });
  </script>
</body>
</html>
    `
  }

  // ✅ For App.jsx, render React component with Babel transformer
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root {
      width: 100vw;
      height: 100vh;
      overflow: auto;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <!-- User code with JSX -->
  <script type="text/babel">
    try {
      ${code}
      
      if (typeof App !== 'function') {
        throw new Error('App component not found. Make sure your code defines: function App() { return (...) }');
      }
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
      
      console.log('%c✅ Preview rendered successfully', 'color: #10b981; font-weight: bold;');
      
    } catch (error) {
      console.error('%c❌ Preview Error:', 'color: #ef4444; font-weight: bold;', error);
      
      document.getElementById('root').innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
          <div style="max-width: 600px; width: 100%; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
            <div style="width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
              <svg style="width: 32px; height: 32px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            
            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700; text-align: center;">
              Preview Error
            </h2>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="margin: 0; color: #374151; font-family: 'Monaco', monospace; font-size: 14px; line-height: 1.6; word-break: break-word;">
                \${error.message}
              </p>
            </div>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px;">
              <p style="margin: 0 0 12px 0; color: #1e40af; font-weight: 600; font-size: 14px;">
                💡 Expected format:
              </p>
              <pre style="margin: 0; color: #1f2937; font-family: 'Monaco', monospace; font-size: 13px; line-height: 1.6; overflow-x: auto; background: white; padding: 12px; border-radius: 4px;">function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <h1>Hello World</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}</pre>
            </div>
            
            <details style="margin-top: 16px;">
              <summary style="cursor: pointer; font-weight: 600; color: #475569; padding: 8px; background: #f8fafc; border-radius: 4px;">
                Show error details
              </summary>
              <div style="margin-top: 12px; padding: 12px; background: #1e293b; border-radius: 6px; color: #e2e8f0; font-family: 'Monaco', monospace; font-size: 12px; overflow-x: auto; max-height: 200px; overflow-y: auto;">
                \${(error.stack || 'No stack trace available').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              </div>
            </details>
          </div>
        </div>
      \`;
    }
  </script>
</body>
</html>
  `
}
