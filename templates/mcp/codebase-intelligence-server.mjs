#!/usr/bin/env node
import readline from "node:readline";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
function send(value) { process.stdout.write(JSON.stringify(value) + "\n"); }
send({ ok: true, server: "ai-code-intelligence-toolkit", version: "1.0.6", mode: "stdio", tools: ["graph.query", "graph.doctor", "preflight"] });
rl.on("line", (line) => {
  let msg = null;
  try { msg = JSON.parse(line); } catch { send({ ok:false, error:"invalid json" }); return; }
  send({ ok:true, id: msg.id ?? null, note:"Run npm scripts for full functionality.", scripts:["npm run ai:graph:query", "npm run ai:graph:doctor", "npm run ai:preflight"] });
});
