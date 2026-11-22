/* ==========================================================================
   Describes every editable piece of text and every photo on the public website.
   The admin builds its forms from this file, and the public pages read the same keys.
   To make something new editable: add it here, then read it in the page component.
   ========================================================================== */

const t = (key, label, hint, placeholder) => ({ kind: "text", key, label, hint, placeholder });
const ta = (key, label, hint, rows = 3) => ({ kind: "textarea", key, label, hint, rows });
const img = (key, label, hint, folder = "pages") => ({ kind: "image", key, label, hint, folder });

/** A headline made of a plain part and a highlighted (italic, caramel) part. */
const headline = (prefix, label = "Headline") => [
  t(`${prefix}_title`, `${label}: plain part`, "The normal-looking words.", "A cup for"),
  t(`${prefix}_accent`, `${label}: highlighted part`, "Shown in italic caramel after the plain part.", "every mood."),
];

const intro = (prefix = "intro") => ({
  title: "Top of the page",
  hint: "The big heading at the top.",
  fields: [
    t(`${prefix}_eyebrow`, "Small label above the heading"),
    ...headline(prefix, "Heading"),
    ta(`${prefix}_lead`, "Intro sentence", undefined, 2),
  ],
});

const cta = () => ({
  title: "Closing banner",
  hint: "The light banner at the bottom of the page. Leave the heading empty to hide it.",
  fields: [t("cta_eyebrow", "Small label"), ...headline("cta", "Heading"), ta("cta_text", "Text", undefined, 2)],
});

export const ICONS = [
  "coffee",
  "utensils",
  "star",
  "users",
  "map-pin",
  "calendar",
  "clock",
  "phone",
  "mail",
  "sparkles",
  "shield",
  "hourglass",
  "bell",
  "clipboard",
  "check-circle",
].map((v) => ({ value: v, label: v.replace("-", " ") }));

export const PAGES = [
  {
    key: "site",
    label: "Site settings",
    description: "Brand name, logo, contact details, social links and footer. These appear on every page.",
    sections: [
      {
        title: "Brand",
        fields: [
          t("brand_name", "Brand name", "Shown in the header, footer and browser tab.", "BLK & BRWN"),
          t("brand_tagline", "Tagline under the name", "Small capital letters in the header.", "COFFEE · COMMUNITY · COMFORT"),
          img("logo", "Logo", "A square image works best. It is also the browser-tab icon and the map pin.", "brand"),
          ta("meta_description", "Short description for search engines", "One or two sentences (about 150 characters).", 2),
        ],
      },
      {
        title: "Contact details",
        fields: [
          t("phone", "Phone number", undefined, "+63 927 007 3822"),
          t("email", "Email address"),
          t("facebook_url", "Facebook page link", "Starts with https://"),
          t("instagram_url", "Instagram link", "Starts with https://"),
        ],
      },
      {
        title: "Footer",
        fields: [
          ...headline("footer", "Footer heading"),
          t("footer_blurb", "Short line under the heading"),
          t("footer_credit", "Text after the copyright line", "Shown after “© 2026 Brand name”."),
        ],
      },
    ],
  },
  {
    key: "home",
    label: "Home page",
    description:
      "Everything on the landing page. A section only appears when it has content. Menu favorites and the branch ride come from Menu and Branches.",
    path: "/",
    sections: [
      {
        title: "Hero (the first screen)",
        hint: "Hidden if there is no heading and no photo.",
        fields: [
          t("hero_eyebrow", "Small label"),
          ...headline("hero", "Headline"),
          ta("hero_lead", "Intro sentence", undefined, 2),
          img("hero_image", "Hero photo", "Square works best (1024 × 1024 or larger). It expands to fill the screen as you scroll."),
          t("hero_image_alt", "Photo description", "For screen readers."),
          t(
            "badge_text",
            "Spinning ring text",
            "Repeat a short phrase so it fills the circle, e.g. “Coffee · Community · Comfort · Coffee · Community · Comfort ·”"
          ),
          t("overlay_text", "Big words over the photo: plain part", undefined, "Good coffee."),
          t("overlay_accent", "Big words over the photo: highlighted part", undefined, "Even better company."),
          {
            kind: "items",
            key: "stats",
            label: "Numbers under the hero",
            addLabel: "Add a number",
            itemTitle: "Number",
            fields: [
              t("label", "Label", undefined, "Branches"),
              t("value", "Number", "Digits only, e.g. 7", "7"),
              t("suffix", "After the number", "e.g. +"),
              { kind: "bool", key: "plain", label: "Show as a year (no comma, e.g. 2021)" },
            ],
          },
        ],
      },
      {
        title: "Scrolling words band",
        fields: [{ kind: "strings", key: "marquee_words", label: "Words", hint: "They scroll across the screen in a loop.", addLabel: "Add a word" }],
      },
      {
        title: "Who we are (words light up as you scroll)",
        fields: [
          t("story_eyebrow", "Small label"),
          ta("story_text", "Paragraph", undefined, 5),
          t("story_accent", "Last words (highlighted)", "Shown in italic at the end of the paragraph."),
        ],
      },
      {
        title: "Three quick facts",
        fields: [
          {
            kind: "items",
            key: "facts",
            label: "Facts",
            addLabel: "Add a fact",
            itemTitle: "Fact",
            fields: [{ kind: "select", key: "icon", label: "Icon", options: ICONS }, t("title", "Title"), ta("text", "Text", undefined, 2)],
          },
        ],
      },
      {
        title: "Menu favorites (pinned scroll scene)",
        hint: "The drinks shown come from Menu: tick “Show on the home page” on an item. Hidden if none are ticked.",
        fields: [t("drinks_eyebrow", "Small label"), ...headline("drinks", "Heading")],
      },
      {
        title: "Branch ride (horizontal scroll)",
        hint: "The cards come from Branches. Hidden if there are no branches.",
        fields: [
          t("ride_eyebrow", "Small label"),
          ...headline("ride", "Heading"),
          t("ride_lead", "Intro sentence"),
          t("ride_end_title", "Last card: heading"),
          ta("ride_end_text", "Last card: text", undefined, 2),
        ],
      },
      {
        title: "Story with photo",
        hint: "Hidden if there is no heading and no photo.",
        fields: [
          t("tanza_eyebrow", "Small label"),
          ...headline("tanza", "Heading"),
          ta("tanza_lead", "Lead sentence", undefined, 2),
          ta("tanza_text", "Text", undefined, 2),
          img("tanza_image", "Photo", "Portrait (4:5) works best."),
          t("tanza_image_alt", "Photo description"),
        ],
      },
      {
        title: "Photo strips",
        hint: "The photos come from Gallery: tick “Show on the home page” on a photo. Hidden if none are ticked.",
        fields: [t("strips_eyebrow", "Small label"), ...headline("strips", "Heading")],
      },
      {
        title: "How reserving works (khaki banner)",
        fields: [
          t("how_eyebrow", "Small label"),
          ...headline("how", "Heading"),
          ta("how_lead", "Lead sentence", undefined, 2),
          {
            kind: "items",
            key: "how_steps",
            label: "Steps",
            addLabel: "Add a step",
            itemTitle: "Step",
            fields: [t("title", "Title"), t("text", "Text")],
          },
        ],
      },
      {
        title: "Keep in the loop",
        hint: "The Facebook and Instagram buttons come from Site settings.",
        fields: [t("loop_eyebrow", "Small label"), ...headline("loop", "Heading"), ta("loop_text", "Text", undefined, 2)],
      },
    ],
  },
  {
    key: "about",
    label: "About page",
    description: "Our story page.",
    path: "/about",
    sections: [
      intro(),
      {
        title: "How it started",
        fields: [
          t("start_eyebrow", "Small label"),
          ...headline("start", "Heading"),
          ta("start_lead", "Lead paragraph", undefined, 4),
          t("start_notice", "Notice box text", "A dashed box, e.g. “More history coming soon”."),
          t("start_notice_badge", "Notice badge", undefined, "COMING SOON"),
          t("serve_title", "“What we serve” heading"),
          ta("serve_text", "“What we serve” text", undefined, 4),
          img("photo", "Photo", "Portrait (4:5) works best."),
          t("photo_alt", "Photo description"),
        ],
      },
      {
        title: "How we grew (timeline)",
        fields: [
          t("grow_eyebrow", "Small label"),
          ...headline("grow", "Heading"),
          t("grow_text", "Text"),
          {
            kind: "items",
            key: "timeline",
            label: "Timeline steps",
            addLabel: "Add a step",
            itemTitle: "Step",
            fields: [t("title", "Title"), t("text", "Text")],
          },
        ],
      },
      {
        title: "What matters to us",
        fields: [
          t("values_eyebrow", "Small label"),
          ...headline("values", "Heading"),
          { kind: "strings", key: "values", label: "Values", addLabel: "Add a value" },
        ],
      },
      { title: "Mission and vision", fields: [ta("mission", "Mission", undefined, 3), ta("vision", "Vision", undefined, 3)] },
      {
        title: "What you can expect",
        fields: [
          t("expect_eyebrow", "Small label"),
          ...headline("expect", "Heading"),
          {
            kind: "items",
            key: "expect",
            label: "Cards",
            addLabel: "Add a card",
            itemTitle: "Card",
            fields: [{ kind: "select", key: "icon", label: "Icon", options: ICONS }, t("title", "Title"), ta("text", "Text", undefined, 2)],
          },
        ],
      },
      cta(),
    ],
  },
  {
    key: "menu",
    label: "Menu page",
    description: "Texts around the menu. The categories and items themselves are managed under Menu.",
    path: "/menu",
    sections: [intro(), { title: "Bottom banner", fields: [t("footnote_title", "Heading"), ta("footnote_text", "Text", undefined, 2)] }],
  },
  {
    key: "branches",
    label: "Branches page",
    description: "Texts around the branch finder. The branches themselves are managed under Branches.",
    path: "/branches",
    sections: [
      intro(),
      { title: "Map", fields: [t("map_title", "Line above the map", undefined, "All 7 branches. Tap a pin for details.")] },
      { title: "Note before your visit", fields: [t("note_title", "Heading"), ta("note_text", "Text", undefined, 2)] },
    ],
  },
  {
    key: "gallery",
    label: "Gallery page",
    description: "Texts around the gallery. The photos are managed under Gallery.",
    path: "/gallery",
    sections: [intro(), cta()],
  },
  {
    key: "contact",
    label: "Contact page",
    description: "Phone, email and social links come from Site settings.",
    path: "/contact",
    sections: [
      intro(),
      {
        title: "Details card",
        fields: [
          t("hello_title", "Card heading", undefined, "Say hello"),
          t("home_branch", "Home branch address"),
          t("hours_text", "Hours line", undefined, "Each branch keeps its own hours."),
        ],
      },
      { title: "“Looking for a branch?” card", fields: [t("branch_card_title", "Heading"), ta("branch_card_text", "Text", undefined, 2)] },
      { title: "Form", fields: [t("form_note", "Note under the send button"), t("success_message", "Message shown after sending")] },
    ],
  },
  {
    key: "reserve",
    label: "Reserve page",
    description: "Texts around the reservation form. Guests choose from the branches you add under Branches.",
    path: "/reserve",
    sections: [
      intro(),
      {
        title: "Guidelines card",
        fields: [
          t("guidelines_title", "Card heading"),
          {
            kind: "items",
            key: "guidelines",
            label: "Guidelines",
            addLabel: "Add a guideline",
            itemTitle: "Guideline",
            fields: [{ kind: "select", key: "icon", label: "Icon", options: ICONS }, ta("text", "Text", undefined, 2)],
          },
        ],
      },
      {
        title: "What happens next",
        fields: [
          t("next_title", "Card heading"),
          {
            kind: "items",
            key: "steps",
            label: "Steps",
            addLabel: "Add a step",
            itemTitle: "Step",
            fields: [t("title", "Title"), t("text", "Text")],
          },
        ],
      },
      { title: "“Prefer to call?” card", fields: [t("call_title", "Heading"), ta("call_text", "Text", undefined, 2)] },
      {
        title: "Form messages",
        fields: [t("submit_note", "Note next to the submit button"), t("success_message", "Message shown after a request is sent")],
      },
    ],
  },
  {
    key: "track",
    label: "Reservation status page",
    description: "Guests enter their reference (e.g. BNB-1012-001) to see where their request stands.",
    path: "/track",
    sections: [
      intro(),
      { title: "Help card", fields: [t("help_eyebrow", "Small label"), t("help_title", "Heading"), ta("help_text", "Text", undefined, 3)] },
    ],
  },
  {
    key: "privacy",
    label: "Privacy page",
    description: "Your privacy notice.",
    path: "/privacy",
    sections: [
      intro(),
      {
        title: "Sections",
        fields: [
          {
            kind: "items",
            key: "sections",
            label: "Privacy sections",
            addLabel: "Add a section",
            itemTitle: "Section",
            fields: [t("heading", "Heading"), ta("body", "Text", "Leave a blank line to start a new paragraph.", 5)],
          },
        ],
      },
    ],
  },
];

export const pageByKey = (key) => PAGES.find((p) => p.key === key);
