<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 880 405" width="880" height="405">
  <style>
    :root {
      --bg: #ffffff;
      --border: #d0d7de;
      --text: #24292f;
      --muted: #57606a;
      --accent: #0969da;
      --accent2: #8250df;
      --prompt-user: #1a7f37;
      --drink: #8b5a2b;
      --drink-accent: #b98a5e;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0d1117;
        --border: #30363d;
        --text: #c9d1d9;
        --muted: #8b949e;
        --accent: #58a6ff;
        --accent2: #d2a8ff;
        --prompt-user: #3fb950;
        --drink: #c68a52;
        --drink-accent: #d9b48f;
      }
    }
    .term {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: 880px;
      height: 405px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      font-family: ui-monospace, "Cascadia Code", "Consolas", "SFMono-Regular", Menlo, monospace;
      color: var(--text);
    }
    .promptbar { flex: 0 0 auto; box-sizing: border-box; padding: 14px 32px 0 32px; }
    .prompt { font-size: 12px; white-space: nowrap; }
    .p-user { color: var(--prompt-user); font-weight: 700; }
    .p-sym { color: var(--muted); margin: 0 2px; }
    .p-cmd { color: var(--text); font-weight: 700; }
    .body { flex: 1 1 auto; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 20px; padding: 12px 60px 22px 60px; }
    .columns { display: flex; width: 100%; gap: 60px; }
    .col { flex: 1 1 0; min-width: 0; }
    .col-title { font-size: 14px; color: var(--accent); font-weight: 700; margin: 0 0 8px 0; }
    .col ul { list-style: none; margin: 0; padding: 0; font-size: 14px; line-height: 1.9; }
    .col li { color: var(--text); }
    .col li b { color: var(--accent2); font-weight: 700; }
    .bullet { color: var(--muted); margin-right: 6px; }
    .divider { flex: 0 0 auto; height: 1px; background: var(--border); width: 100%; }
    .coffee-row { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .aa {
      flex: 0 0 auto;
      margin: 0;
      font-size: 13px;
      line-height: 1.28;
      color: var(--drink);
      white-space: pre;
    }
    .aa .accent { color: var(--drink-accent); }
    .aa .mirror { display: inline-block; transform: scaleX(-1); }
    .caption { font-size: 14px; color: var(--muted); font-style: italic; }
    .coffee-title { align-self: flex-start; font-size: 14px; color: var(--accent); font-weight: 700; margin: 0; }
  </style>
  <foreignObject width="100%" height="100%">
    <xhtml:div class="term">
      <xhtml:div class="promptbar">
        <xhtml:div class="prompt"><xhtml:span class="p-user">fuyuu57577</xhtml:span><xhtml:span class="p-sym">@</xhtml:span><xhtml:span class="p-cmd">github</xhtml:span> <xhtml:span class="p-sym">$</xhtml:span> <xhtml:span class="p-cmd">now</xhtml:span></xhtml:div>
      </xhtml:div>
      <xhtml:div class="body">
        <xhtml:div class="columns">
          {{columns}}
        </xhtml:div>
        <xhtml:div class="divider"></xhtml:div>
        <xhtml:div class="coffee-row" style="{{drinkStyle}}">
          <xhtml:p class="coffee-title">A drink to match my mood</xhtml:p>
          {{aa}}
        </xhtml:div>
      </xhtml:div>
    </xhtml:div>
  </foreignObject>
</svg>
