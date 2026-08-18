<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 {{width}} {{height}}" width="{{width}}" height="{{height}}">
  <style>
    {{sharedStyles}}
    :root { --drink: {{drinkColorLight}}; --drink-accent: {{drinkAccentLight}}; }
    @media (prefers-color-scheme: dark) {
      :root { --drink: {{drinkColorDark}}; --drink-accent: {{drinkAccentDark}}; }
    }
    .term { width: {{width}}px; height: {{height}}px; }
    /* shared.css centers .titletext via margin:auto + a -18px shift, which
       assumes a wide fixed-width card with slack to center into. This card
       is shrink-wrapped to its content instead, so there's no slack — the
       shift alone would push the text straight into the dots. Just flow it
       naturally after them. */
    .titletext { margin: 0; transform: none; }
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
    <xhtml:div class="term">
      {{titlebar}}
      {{promptbar}}
      <xhtml:div class="body">
        {{aa}}
      </xhtml:div>
    </xhtml:div>
  </foreignObject>
</svg>
