import * as vscode from "vscode";

export class HealthPanel {
  public static currentPanel: HealthPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;

  static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.ViewColumn.Beside;
    if (HealthPanel.currentPanel) {
      HealthPanel.currentPanel._panel.reveal(column);
      return HealthPanel.currentPanel;
    }
    const panel = new HealthPanel(
      vscode.window.createWebviewPanel("skaiHealth", "SkaiScraper Health", column, {
        enableScripts: true,
        retainContextWhenHidden: true,
      }),
      extensionUri
    );
    HealthPanel.currentPanel = panel;
    return panel;
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._panel.onDidDispose(() => (HealthPanel.currentPanel = undefined));
    this._panel.webview.html = this._html();
  }

  update(results: any) {
    this._panel.webview.postMessage({ type: "results", payload: results });
  }

  appendLog(line: string) {
    this._panel.webview.postMessage({ type: "log", payload: line });
  }

  private _html() {
    const cssUri = this._panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "panel.css")
    );
    const jsUri = this._panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "panel.js")
    );
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="${cssUri}">
<title>SkaiScraper Health</title>
</head>
<body>
<header>
  <h1>SkaiScraper Health</h1>
  <div class="actions">
    <button onclick="vscode.postMessage({type:'run'})">Run All Checks</button>
    <button onclick="vscode.postMessage({type:'tail'})">Tail Vercel Logs</button>
  </div>
</header>

<section id="grid">
  <div class="card"><h3>Endpoints</h3><div id="endpoints"></div></div>
  <div class="card"><h3>DNS</h3><div id="dns"></div></div>
  <div class="card"><h3>Env Sanity</h3><div id="env"></div></div>
  <div class="card"><h3>Stripe Webhook</h3><div id="stripe"></div></div>
</section>

<section class="card" id="logs"><h3>Vercel Logs</h3><pre></pre></section>

<script>
  const vscode = acquireVsCodeApi();
  window.addEventListener('message', (e) => {
    const {type, payload} = e.data || {};
    if(type==='results') {
      render(payload);
    }
    if(type==='log') {
      const pre = document.querySelector('#logs pre');
      pre.textContent += payload + "\\n";
      pre.scrollTop = pre.scrollHeight;
    }
  });

  function badge(ok){ return '<span class="'+(ok?'ok':'bad')+'">'+(ok?'OK':'FAIL')+'</span>'; }

  function render(r){
    const ep = document.getElementById('endpoints');
    ep.innerHTML = r.endpoints.map(x => \`<div>\${badge(x.ok)} <code>\${x.url}</code> <small>(\${x.status})</small></div>\`).join('');

    const dns = document.getElementById('dns');
    dns.innerHTML = \`<div>\${badge(r.dns?.ok)} Resolved: <code>\${r.dns?.address||'N/A'}</code></div>\`;

    const env = document.getElementById('env');
    env.innerHTML = r.env.keys.map(k => \`<div>\${badge(k.present)} \${k.name}</div>\`).join('');

    const stripe = document.getElementById('stripe');
    stripe.innerHTML = \`<div>\${badge(r.stripe?.ok)} POST /api/stripe/webhook → \${r.stripe?.status||'N/A'}</div>\`;
  }

  // Buttons
  window.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('click', (e)=>{
      if(e.target?.innerText?.startsWith('Run All')) vscode.postMessage({type:'run'});
      if(e.target?.innerText?.startsWith('Tail Vercel')) vscode.postMessage({type:'tail'});
    });
  });
</script>
<script src="${jsUri}"></script>
</body>
</html>`;
  }
}
