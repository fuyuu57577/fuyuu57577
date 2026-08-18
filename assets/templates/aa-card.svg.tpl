<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 {{width}} {{height}}" width="{{width}}" height="{{height}}">
  <style>
    :root {
      --bg: #ffffff;
      --panel: #f6f8fa;
      --border: #d0d7de;
      --text: #24292f;
      --muted: #57606a;
      --dot-red: #ff5f56;
      --dot-yellow: #ffbd2e;
      --dot-green: #27c93f;
      --prompt-user: #1a7f37;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0d1117;
        --panel: #161b22;
        --border: #30363d;
        --text: #c9d1d9;
        --muted: #8b949e;
        --prompt-user: #3fb950;
      }
    }
    .card {
      box-sizing: border-box;
      width: {{width}}px;
      height: {{height}}px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      font-family: ui-monospace, "Cascadia Code", "Consolas", "SFMono-Regular", Menlo, monospace;
      color: var(--text);
      display: flex;
      flex-direction: column;
    }
    .titlebar {
      flex: 0 0 34px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 14px;
      background: var(--panel);
      border-bottom: 1px solid var(--border);
    }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot.r { background: var(--dot-red); }
    .dot.y { background: var(--dot-yellow); }
    .dot.g { background: var(--dot-green); }
    .titletext { margin: 0 auto; font-size: 12px; color: var(--muted); transform: translateX(-18px); }
    .promptbar { flex: 0 0 auto; box-sizing: border-box; padding: 14px 40px 0 40px; }
    .prompt { font-size: 12px; white-space: nowrap; }
    .p-user { color: var(--prompt-user); font-weight: 700; }
    .p-sym { color: var(--muted); margin: 0 2px; }
    .p-cmd { color: var(--text); font-weight: 700; }
    .body {
      flex: 1 1 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 10px 40px 24px 40px;
    }
    .aa {
      margin: 0;
      font-size: 13px;
      line-height: 1.28;
      color: var(--drink);
      white-space: pre;
    }
    .aa .accent { color: var(--drink-accent); }
    .aa .mirror { display: inline-block; transform: scaleX(-1); }
    .caption { font-size: 14px; color: var(--muted); font-style: italic; white-space: nowrap; }
  </style>
  <foreignObject width="100%" height="100%">
    <xhtml:div class="card">
      <xhtml:div class="titlebar">
        <xhtml:div class="dot r"></xhtml:div>
        <xhtml:div class="dot y"></xhtml:div>
        <xhtml:div class="dot g"></xhtml:div>
        <xhtml:div class="titletext">fuyuu57577@github — {{id}}</xhtml:div>
      </xhtml:div>
      <xhtml:div class="promptbar">
        <xhtml:div class="prompt"><xhtml:span class="p-user">fuyuu57577</xhtml:span><xhtml:span class="p-sym">@</xhtml:span><xhtml:span class="p-cmd">github</xhtml:span> <xhtml:span class="p-sym">$</xhtml:span> <xhtml:span class="p-cmd">{{id}}</xhtml:span></xhtml:div>
      </xhtml:div>
      <xhtml:div class="body" style="{{drinkStyle}}">
        {{aa}}
      </xhtml:div>
    </xhtml:div>
  </foreignObject>
</svg>
