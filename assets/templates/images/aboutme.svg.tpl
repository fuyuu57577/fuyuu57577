<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 880 {{height}}" width="880" height="{{height}}">
  <style>
    {{sharedStyles}}
    :root { --snow: #54aeff; }
    @media (prefers-color-scheme: dark) {
      :root { --snow: #79c0ff; }
    }
    .term { width: 880px; height: {{height}}px; }
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
      {{titlebar}}
      {{promptbar}}
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
