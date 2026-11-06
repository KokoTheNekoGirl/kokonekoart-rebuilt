---
title: "Project Name"
description: "One or two sentences. Used on the archive card and for SEO."
completed: 2025-01-31 # YYYY-MM-DD. Archive sorts by this. Before 2024-05-01 adds the college note automatically.
categories: [live-site, website] # discord-bot | live-site | design-mockups | figma-prototype | website | react-typescript | astro-typescript
heroImage: "@portfolio/project-name.png"
heroAlt: "Describe the featured image"

# Slides after the title slide. Any title, markdown content, any number of images.
# Layout flips sides each slide. Remove any you don't need.
slides:
  - title: Context
    content: |
      Markdown works here: **bold**, [links](https://example.com), lists.

      A second paragraph.
    images:
      - src: "@portfolio/project-name-context.png"
        alt: Describe the image
  - title: Inspiration
    content: |
      Text only slides are fine too.
  - title: Process
    content: |
      - Multiple images show as a grid.
    images:
      - src: "@portfolio/process-1.png"
        alt: First step
      - src: "@portfolio/process-2.png"
        alt: Second step

# "Final Result" slide: only the links you fill in become buttons.
links:
  github: https://github.com/you/repo # View code
  live: project-folder # folder in public/project -> /project/project-folder/  (View live)
  figma:
    url: https://www.figma.com/proto/...
    type: prototype # or: design
  mockup: "@portfolio/project-name.pdf" # View mockup
  site: https://example.com # View live site

finalNote: Not viewed well on mobile. # shown as "NOTE: ..." (optional)
---

Optional: any text here shows on the first slide under the date.
