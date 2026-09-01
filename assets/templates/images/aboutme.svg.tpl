<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 {{width}} {{height}}" width="{{width}}" height="{{height}}">
  <style>
    {{sharedStyles}}
    :root { --snow: #54aeff; }
    @media (prefers-color-scheme: dark) {
      :root { --snow: #79c0ff; }
    }
    .term { width: {{width}}px; height: {{height}}px; }
    /* .titletext's centering trick (shared.css) needs slack that a narrow
       mobile canvas doesn't have — see aa-card.svg.tpl for the same fix. */
    .term.mobile .titletext { margin: 0; transform: none; }
    .body {
      flex: 1 1 auto;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 32px;
      padding: 28px 32px;
      min-height: 0;
    }
    .term.mobile .body { flex-direction: column; align-items: stretch; gap: 16px; padding: 18px 20px 10px 20px; }
    .logo {
      flex: 0 0 190px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .term.mobile .logo { flex: 0 0 auto; }
    .snowflake { font-size: 130px; line-height: 1; color: var(--snow); }
    .avatar { width: 160px; height: 160px; border-radius: 50%; object-fit: cover; border: 3px solid var(--border); box-shadow: 0 0 0 5px var(--panel); }
    .term.mobile .avatar { width: 84px; height: 84px; }
    .info { flex: 1; font-size: 14px; line-height: 1.85; min-width: 0; }
    .term.mobile .info { font-size: 13px; line-height: 1.7; }
    .head { font-size: 17px; font-weight: 700; color: var(--text); }
    .rule { color: var(--border); margin: 4px 0 10px 0; letter-spacing: 1px; }
    .row { display: flex; }
    .term.mobile .row { flex-direction: column; }
    .label { flex: 0 0 128px; color: var(--accent); font-weight: 700; }
    .term.mobile .label { flex: 0 0 auto; margin-bottom: 1px; }
    .value { color: var(--text); }
    .value b { color: var(--accent2); font-weight: 700; }
    .palette { flex: 0 0 auto; box-sizing: border-box; display: flex; padding: 0 32px 22px 32px; gap: 6px; }
    .term.mobile .palette { padding: 0 20px 16px 20px; flex-wrap: wrap; }
    .sw { width: 34px; height: 14px; border-radius: 3px; }
    /* Desktop shows label:value rows (.rows-desktop); mobile swaps in
       .rows-mobile, which groups Languages/Frameworks/Tools into one "Tech"
       chip row and Socials+Contact into one "Contact" chip row instead of
       repeating them as separate rows — a real layout change, not just the
       desktop rows shrunk down. */
    .rows-mobile { display: none; }
    .term.mobile .rows-desktop { display: none; }
    .term.mobile .rows-mobile { display: flex; flex-direction: column; gap: 10px; }
    .chip-row { display: inline-flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--panel);
      color: var(--text);
      font-size: 11px;
      line-height: 1.4;
    }
    .chip-icon { width: 12px; height: 12px; flex: 0 0 auto; }
  </style>
  <foreignObject width="100%" height="100%">
    <xhtml:div class="{{termClass}}">
      {{titlebar}}
      {{promptbar}}
      <xhtml:div class="body">
        <xhtml:div class="logo">
          <xhtml:img class="avatar" src="{{avatar}}" />
        </xhtml:div>
        <xhtml:div class="info">
          <xhtml:div class="head">fuyuu57577@github</xhtml:div>
          <xhtml:div class="rule">-------------------------------</xhtml:div>
          <xhtml:div class="rows-desktop">{{rows}}</xhtml:div>
          <xhtml:div class="rows-mobile">{{mobileRows}}</xhtml:div>
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
