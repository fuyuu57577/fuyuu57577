<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 880 130" width="880" height="130">
  <style>
    {{sharedStyles}}
    .term { position: relative; width: 880px; height: 130px; }
    .body {
      flex: 1 1 auto;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 22px;
      padding: 0 32px;
    }
    .icon { flex: 0 0 auto; width: 44px; height: 44px; color: var(--text); }
    .info { min-width: 0; }
    .handle { font-size: 19px; font-weight: 700; }
    .url { font-size: 12px; color: var(--accent); margin-top: 3px; }
    .goto {
      position: absolute;
      right: 16px;
      bottom: 12px;
      width: 20px;
      height: 20px;
      color: var(--muted);
      opacity: 0.75;
    }
    .goto path, .goto polyline, .goto line { stroke: currentColor; }
  </style>
  <foreignObject width="100%" height="100%">
    <xhtml:div class="term">
      {{promptbar}}
      <xhtml:div class="body">
        {{icon}}
        <xhtml:div class="info">
          <xhtml:div class="handle">{{handle}}</xhtml:div>
          <xhtml:div class="url">{{url}}</xhtml:div>
        </xhtml:div>
      </xhtml:div>
      <svg class="goto" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </xhtml:div>
  </foreignObject>
</svg>
