// Simple typographic replacements
//
// +- → ±
// ... → … (also ?.... → ?.., !.... → !..)
// ???????? → ???, !!!!! → !!!, `,,` → `,`
// -- → &ndash;, --- → &mdash;
// --> <-- -> <- to → ← → ←
//
// Disabled replacements:
//
// (c) (C) → ©
// (tm) (TM) → ™
// (r) (R) → ®
// (p) (P) -> §

let RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--|-->|<--|->|<-/;

function replaceRare(inlineTokens) {
  let i,
    token,
    inside_autolink = 0;

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];

    if (token.type === "text" && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content
          .replace(/\+-/g, "±")
          // Custom arrows
          .replace(/(^|\s)-{1,2}>(\s|$)/gm, "\u0020\u2192\u0020")
          .replace(/(^|\s)<-{1,2}(\s|$)/gm, "\u0020\u2190\u0020")
          // .., ..., ....... -> …
          // but ?..... & !..... -> ?.. & !..
          .replace(/\.{2,}/g, "…")
          .replace(/([?!])…/g, "$1..")
          .replace(/([?!]){4,}/g, "$1$1$1")
          .replace(/,{2,}/g, ",")
          // em-dash
          .replace(/(^|[^-])---(?=[^-]|$)/gm, "$1\u2014")
          // en-dash
          .replace(/(^|\s)--(?=\s|$)/gm, "$1\u2013")
          .replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1\u2013");
      }
    }

    if (token.type === "link_open" && token.info === "auto") {
      inside_autolink--;
    }

    if (token.type === "link_close" && token.info === "auto") {
      inside_autolink++;
    }
  }
}

function replace(state) {
  let blkIdx;

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline") {
      continue;
    }

    if (RARE_RE.test(state.tokens[blkIdx].content)) {
      replaceRare(state.tokens[blkIdx].children);
    }
  }
}

export function setup(helper) {
  helper.registerPlugin((md) => {
    if (md.options.typographer) {
      md.core.ruler.at("replacements", replace);
    }
  });
}
