---
title: "RegPoints"
description: "This is a passion project I work on in my free time. I manage and develop this project with my business partner and we serve this tool free of charge."
completed: 2025-09-23
categories: [discord-bot, live-site]
heroImage: "@assets/portfolio/regpoints.png"
heroAlt: "Screenshot of the RegPoints landing page."

slides:
  - title: Context
    content: |
      Regpoints is a point system reserved for the Ponytown [Regiment community](https://ponytown.fandom.com/wiki/Category:Regiments). It was created in 2020 by Nemm. Unfortunately, the project was shut down in 2023 due to financial issues.

      In 2025, Ponytown Regiment Services contacted Nemm, with the assistance of Project: Colorfes, to retrieve the RegPoints files and get them operational again.

      The current version of Regpoints is a continuation of the original project, updated for modern use and with new features. We perform security updates, code refactoring, and bug patches. We're currently open in version 2.0, and no longer invite access only. Currently, there are 90+ Regiments using our service.
    images:
      - src: "@portfolio/regpoints-sneakpeak.png"
        alt: "A sneak peak into RegPoints new design"

  - title: Inspiration
    content: |
      PonyTown Regiment Services assigns fruit imagery to their projects. We assigned RegPoints the fruit: **apple**. The 3.x CSS revamp colour palette uses red, green, and yellow, the three main colours found on fruit. Here are a few images that show our progress in this upcoming update.
    images:
      - src: "@portfolio/regpoints-brand-standards.png"
        alt: "RegPoints brand standards sheet"

  - title: Maintenance Process
    content: |
      We host all the files for the project on a private GitHub. There are separate branches for the live site, patch updates, and new features. We always create a new dev branch from a clone of main, then merge back into main once completed, never pushing changes straight into main.

      First, we push updates to a dev branch and pull those changes to "live" dev site. Then, we have our community testers thoroughly experiment with the improvements, accommodating for all intended or unintended situations.

      Once all user tests and quality assurance is completed, we schedule a maintenance period for the update. During that time, we merge the dev branch into the main branch in GitHub and handle any conflicts. We then pull the new main branch into live site. From there, we inform our community base that the service is back online while monitoring bug reports and error logs to ensure the site operates as expected.

      As reports come in, we do our best to patch things quickly and ensure no further downtime on the service. We follow the same process: create a dev branch ➜ pull to dev instance ➜ merge to main ➜ push to live.

  - title: "Roadmap: Version 2.x.x"
    content: |
      **Minor Update**

      - **Economy Commands, Phase 2:** work, crime, rob, gamble. Togglable, allow/blocklists, and custom work/crime replies. /leaderboard economy option. /economy settings.
      - **Bulk Add Members:** A page to allow bulk manual import of members.
      - **Improve Account Security:** 2FA enabled (email or authenticator app).
      - **Rank Changes:** Improve Promotions/Demotions to auto add/remove rank roles.
      - **Careers:** Implementation of Careers for better member tracking. Allowance for preference for rank > career order or career < rank order, etc.
      - **Pairs:** Implementation of Pairs between members. Allowance for double pairs, human to human, or k9 to k9 pairs.
      - **Enlistment Update:** Allow pronouns + birthday to be captured in the enlistment process. Allow staff only or enlistee only to run the command.
      - **Daily Briefing:** Displays stats daily similar to /regstats, and shows the current birthdays and anniversaries. (Optional Extension)
      - **New Patrol Improvements:** Overall make the process easier, more customizable, cohost, transfer host, patrol types, and autosave.
      - **Discord Regiment Settings:** Hiatus/Break commands give roles, set a leave log channel for linked members.

  - title: "Roadmap: Version 3.x.x or later"
    content: |
      **Major Update**

      - **Webhook Revamp:** Overhaul the existing (and broken) webhook system. Allowance for custom embeds.
      - **Event Schedule:** Implement a schedule for upcoming events and patrols. Automatic weekly and/or daily schedule posts. (Optional Extension)
      - **Self Hosting:** Create a public repository for a self-hosted option that will receive updates alongside the main release.
      - **Dashboard Redesign:** A full redesign of the dashboard, with mobile responsiveness.
      - **Recruitment Forms:** Send a URL to your recruitment form and keep tracking/logs in one place. (Optional Extension)
      - **Discord Login:** Enable Discord account login on Login page. Will merge your data based on Discord email or linked regiment member Discord ID.
      - **Add-Ons Shop:** Extension to allow users to /buy addon automatically. (Optional Extension)
      - **Uniforms and Add-ons:** All uniforms will be locked behind Discord login. Restrict access to certain uniform features until the user logs in with Discord. (Optional Extension)
      - **Translations:** Website + Bot will respect your language preferences. (Translator staff will be needed!)

links:
  github: https://github.com/Ponytown-Regiment-Services
  site: https://regpoints.fr/
finalNote: RegPoints receives continuous support and the site is in a constant state of growth, but you can view what we have achieved so far.
---

**Roles:** Assistant Project Manager, Co-Developer

**Current Stack:** Discord.js, Node.js, PHP, MySQL, GitHub, VPS, Bootstrap

**Upcoming:** Finalized Economy Implimentation, Tailwind CSS Redesign, Interact.js
