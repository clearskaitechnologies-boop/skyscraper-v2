import * as vscode from "vscode";
import { HealthPanel } from "./panel";
import { runAllChecks, toggleVercelLogs } from "./checks";

export function activate(context: vscode.ExtensionContext) {
  let panel: HealthPanel | null = null;

  context.subscriptions.push(
    vscode.commands.registerCommand("skai.openHealthPanel", async () => {
      panel = HealthPanel.createOrShow(context.extensionUri);
      const results = await runAllChecks();
      panel.update(results);
    }),

    vscode.commands.registerCommand("skai.runAllChecks", async () => {
      if (!panel) panel = HealthPanel.createOrShow(context.extensionUri);
      const results = await runAllChecks();
      panel.update(results);
    }),

    vscode.commands.registerCommand("skai.tailVercelLogs", async () => {
      const running = toggleVercelLogs((line) => panel?.appendLog(line));
      vscode.window.showInformationMessage(
        running ? "Tailing Vercel logs…" : "Stopped Vercel log tail."
      );
    })
  );
}

export function deactivate() {}
