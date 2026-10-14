/*
  BLOG-DATA.JS — the "database" for the blog index page (blog.html).

  This is a plain JavaScript file, not a real database or CMS — there's no
  admin screen. To publish a new post:
    1. Write the post as its own HTML file inside the /blog folder
       (copy blog/5-signs-inclusive-program.html as a starting template).
    2. Add one object to the BLOG_POSTS array below describing it.
    3. Set comingSoon to false (or delete that line) once the post's HTML
       file actually exists, so the card becomes clickable.

  Fields:
    slug        — unique id, kebab-case, matches the post's filename
    title       — post title as shown on cards and in <title>/schema
    excerpt     — 1-sentence teaser shown on the card
    category    — one of: "Organizations", "Early Childhood", "Coaching"
                  (matches the site's existing "who Lara helps" segments)
    tags        — array of topical tags, shown as filter chips
    date        — ISO date string (YYYY-MM-DD), used for sorting + display.
                  NOTE: dates below are placeholders until each post is
                  actually published — update to the real publish date.
    readTime    — short display string, e.g. "6 min read"
    icon        — emoji used for the card thumbnail (matches existing
                  homepage blog-teaser style; swap for a real photo later)
    url         — relative path from the SITE ROOT to the post's HTML file
    comingSoon  — true hides the link and shows a "Coming soon" badge
                  instead, for posts that are planned but not written yet
*/

const BLOG_POSTS = [
  {
    slug: "5-signs-inclusive-program",
    title: "5 Signs Your Program Isn't as Inclusive as You Think",
    excerpt: "And the gentle, doable fixes that change everything.",
    category: "Organizations",
    tags: ["Program Development", "Inclusion", "Nonprofits", "Person-Centered Care"],
    date: "2026-09-13",
    readTime: "6 min read",
    icon: "📝",
    url: "blog/5-signs-inclusive-program.html",
    comingSoon: false
  },
  {
    slug: "why-music-reaches-kids",
    title: "Why Music Reaches Kids When Words Can't",
    excerpt: "What happens in a child's brain when we sing together.",
    category: "Early Childhood",
    tags: ["Musikgarten", "Child Development", "Music & Learning"],
    date: null,
    readTime: null,
    icon: "🎶",
    url: "blog/why-music-reaches-kids.html",
    comingSoon: true
  },
  {
    slug: "body-image-beyond-before-and-after",
    title: "Making Peace With the Body You Actually Have",
    excerpt: "A coach's take on body image beyond the before-and-after.",
    category: "Coaching",
    tags: ["Body Image", "Body Neutrality", "Self-Care"],
    date: null,
    readTime: null,
    icon: "💬",
    url: "blog/body-image-beyond-before-and-after.html",
    comingSoon: true
  }
];
