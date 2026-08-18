<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 880 500" width="880" height="500">
  <style>
    :root {
      --bg: #ffffff;
      --panel: #f6f8fa;
      --border: #d0d7de;
      --text: #24292f;
      --muted: #57606a;
      --accent: #0969da;
      --accent2: #8250df;
      --dot-red: #ff5f56;
      --dot-yellow: #ffbd2e;
      --dot-green: #27c93f;
      --snow: #54aeff;
      --prompt-user: #1a7f37;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0d1117;
        --panel: #161b22;
        --border: #30363d;
        --text: #c9d1d9;
        --muted: #8b949e;
        --accent: #58a6ff;
        --accent2: #d2a8ff;
        --snow: #79c0ff;
        --prompt-user: #3fb950;
      }
    }
    .term {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: 880px;
      height: 500px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      font-family: ui-monospace, "Cascadia Code", "Consolas", "SFMono-Regular", Menlo, monospace;
      color: var(--text);
    }
    .titlebar {
      flex: 0 0 34px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 34px;
      padding: 0 14px;
      background: var(--panel);
      border-bottom: 1px solid var(--border);
    }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot.r { background: var(--dot-red); }
    .dot.y { background: var(--dot-yellow); }
    .dot.g { background: var(--dot-green); }
    .titletext {
      margin: 0 auto;
      font-size: 12px;
      color: var(--muted);
      transform: translateX(-18px);
    }
    .body {
      flex: 1 1 auto;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 32px;
      padding: 28px 32px;
      min-height: 0;
    }
    .logo {
      flex: 0 0 190px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .snowflake { font-size: 130px; line-height: 1; color: var(--snow); }
    .avatar { width: 160px; height: 160px; border-radius: 50%; object-fit: cover; border: 3px solid var(--border); box-shadow: 0 0 0 5px var(--panel); }
    .info { flex: 1; font-size: 14px; line-height: 1.85; min-width: 0; }
    .promptbar { flex: 0 0 auto; box-sizing: border-box; padding: 14px 32px 0 32px; }
    .prompt { font-size: 12px; white-space: nowrap; }
    .p-user { color: var(--prompt-user); font-weight: 700; }
    .p-sym { color: var(--muted); margin: 0 2px; }
    .p-cmd { color: var(--text); font-weight: 700; }
    .head { font-size: 17px; font-weight: 700; color: var(--text); }
    .rule { color: var(--border); margin: 4px 0 10px 0; letter-spacing: 1px; }
    .row { display: flex; }
    .label { flex: 0 0 128px; color: var(--accent); font-weight: 700; }
    .value { color: var(--text); }
    .value b { color: var(--accent2); font-weight: 700; }
    .palette { flex: 0 0 auto; box-sizing: border-box; display: flex; padding: 0 32px 22px 32px; gap: 6px; }
    .sw { width: 34px; height: 14px; border-radius: 3px; }
  </style>
  <foreignObject width="100%" height="100%">
    <xhtml:div class="term">
      <xhtml:div class="titlebar">
        <xhtml:div class="dot r"></xhtml:div>
        <xhtml:div class="dot y"></xhtml:div>
        <xhtml:div class="dot g"></xhtml:div>
        <xhtml:div class="titletext">fuyuu57577@github — aboutme</xhtml:div>
      </xhtml:div>
      <xhtml:div class="promptbar">
        <xhtml:div class="prompt"><xhtml:span class="p-user">fuyuu57577</xhtml:span><xhtml:span class="p-sym">@</xhtml:span><xhtml:span class="p-cmd">github</xhtml:span> <xhtml:span class="p-sym">$</xhtml:span> <xhtml:span class="p-cmd">aboutme</xhtml:span></xhtml:div>
      </xhtml:div>
      <xhtml:div class="body">
        <xhtml:div class="logo">
          <xhtml:img class="avatar" src="{{avatar}}" />
        </xhtml:div>
        <xhtml:div class="info">
          <xhtml:div class="head">fuyuu57577@github</xhtml:div>
          <xhtml:div class="rule">-------------------------------</xhtml:div>
          {{rows}}
        </xhtml:div>
      </xhtml:div>
      <xhtml:div class="palette">
        <xhtml:div class="sw" style="background:#0d1117"></xhtml:div>
        <xhtml:div class="sw" style="background:#ff5f56"></xhtml:div>
        <xhtml:div class="sw" style="background:#27c93f"></xhtml:div>
        <xhtml:div class="sw" style="background:#ffbd2e"></xhtml:div>
        <xhtml:div class="sw" style="background:#58a6ff"></xhtml:div>
        <xhtml:div class="sw" style="background:#d2a8ff"></xhtml:div>
        <xhtml:div class="sw" style="background:#79c0ff"></xhtml:div>
        <xhtml:div class="sw" style="background:#c9d1d9"></xhtml:div>
      </xhtml:div>
    </xhtml:div>
  </foreignObject>
</svg>
