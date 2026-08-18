<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 880 {{height}}" width="880" height="{{height}}">
  <style>
    {{sharedStyles}}
    :root { --drink: {{drinkColorLight}}; --drink-accent: {{drinkAccentLight}}; }
    @media (prefers-color-scheme: dark) {
      :root { --drink: {{drinkColorDark}}; --drink-accent: {{drinkAccentDark}}; }
    }
    .term { width: 880px; height: {{height}}px; }
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
    .caption { font-size: 14px; color: var(--muted); font-style: italic; white-space: nowrap; }
    .coffee-title { align-self: flex-start; font-size: 14px; color: var(--accent); font-weight: 700; margin: 0; }
  </style>
  <foreignObject width="100%" height="100%">
    <xhtml:div class="term">
      {{promptbar}}
      <xhtml:div class="body">
        <xhtml:div class="columns">
          {{columns}}
        </xhtml:div>
        <xhtml:div class="divider"></xhtml:div>
        <xhtml:div class="coffee-row">
          <xhtml:p class="coffee-title">A drink to match my mood</xhtml:p>
          {{aa}}
        </xhtml:div>
      </xhtml:div>
    </xhtml:div>
  </foreignObject>
</svg>
