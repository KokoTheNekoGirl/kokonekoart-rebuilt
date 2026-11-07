---
title: "KokoNekoArt"
description: "I’ll walk you through the process of how I created my website and brand! It’s a long story, so bear with me while I share my entire process."
categories: [astro-typescript, live-site]
completed: 2026-11-11
heroImage: "@portfolio/kokonekoart.png"
heroAlt: "Screenshot of the rebuilt KokoNekoArt website"
featured: true

slides:
  - title: Context
    content: |
      Initially, I planned to have two separated sites dedicated to my [commission based digital art](/portfolio/kokonekoart-prototype) and my web portfolio site open to freelancing offers. When looking at the costs to maintain and host, I decided to merge both into one site. I was advised against this by my professors in college, but unfortunately I did not have the resources available to me at the time to keep the two sides of myself separated. I built that initial site in a [custom WordPress theme](https://github.com/KokoTheNekoGirl/kokonekoart), since it was what I could deploy the quickest with what I knew. 

      Later on, I decided to lower hosting costs by restructuring my entire portfolio site into a different framework where I don't pay for hosting. I ultimately decided on Astro, with some TypeScript, to offer a balance of dynamic, reusable components with static content. This instance is now live via Vercel deployment and is version controlled on my GitHub. As of right now, I only repay my annual domain renewal.
    images:
      - src: "@portfolio/kokonekoart-redesign.png"
        alt: The before and after of the site's voice. Before, it was more paper/crafty stop motion animation, whereas now it's dreamy, soft, pastel aesthetic.
  - title: Inspiration
    content: |
      - In my early 20s, I started to become attached to a soft, lilac purple night sky aesthetic. Over time, I’ve just associated it with myself and made the executive decision to base my branding on this very aesthetic.
      - My initial mood shown here was intended for my original portfolio site, so with the merge I decided to more closely resemble it. I later took out the sunset inspiration and doodles, as I wanted to focus in on pastels and softness for my brand voice.
      - I mainly wanted to feature [Koko](https://toyhou.se/11888665.koko), my main fursona. She serves as a mascot to my brand.
      - I knew I wanted overly designed UI features in the form of heavily styled content boxes, cat-like buttons, paw icons, and glassmorphism inspired “viewports”. Being more confident in my CSS skills made it very fun to make them as complex as possible!
      - I wanted an animated, layered background. You may notice animated stars as well as moving clouds in the background, subtle details but it adds so much! I continued adding animations to main content with external libraries.
    images:
      - src: "@portfolio/kokonekoart-moodboard.png"
        alt: The initial moodboard for my portfolio site, repurposed for my redesign.
  - title: Initial Process
    content: |
      I started with very rough sketches and wireframes, as I wanted to get the site structure just right. Once I had a basic idea of the layout and initially having [slick](https://kenwheeler.github.io/slick/) in mind, I dove straight into a local WordPress instance. My experience improved greatly after graduating college, so at the time I felt more comfortable and confident creating a site within WordPress. Though, I always wanted a solution that didn’t involve WordPress. 
      
      I comfortably migrated over my functional price buttons from my prototype commission site for my commissions page. I also added additional options I didn’t have time to add, as it was a school project. A neat feature I figured out was to prepare permalinks for sending PayPal payment or pre-populating the commission request form.
      
      I didn’t pay for any of the plugins I used on the WordPress instance, as I'm financially limited. It offered a unique challenge to work within my limitations.
    images:
      - src: "@portfolio/kokonekoart-wireframe.png"
        alt: The rough wireframe for my redesigned portfolio site.
  - title: Rebuilding Process
    content: |
      At a certain point in my career journey, I had decided that I wanted to grow past pure WordPress-related development. I felt that it had stagnated my learning and made me comfortable in its ecosystem. I needed a new challenge and a goal to work towards. That's when I decided to rebuild my whole site into a new framework.
      
      I researched and tested which deployments would work best with my skill level and ultimate goals for my desired site architecture. I tried Next.js with a headless WordPress instance, but I still wanted to challenge myself even further by straying away from CMS. As much as I love visual interfaces, I did want to learn more code-heavy frameworks. That's when I discovered Astro, with its dynamic components and markdown blog content. I got to work immediately in a local Astro project and began refactoring my HTML into Astro files.
      
      This rebuild also gave me the opportunity to redesign certain pages that bugged me, such as my portfolio piece case studies and my TOS page. As well, I could push my accessibility knowledge even further and rebuild SEO on my own. I also updated to [swiper.js](https://swiperjs.com/) for more flexibility and better compatibility.

      I discovered [Umami](https://umami.is) when I was researching alternative analytics trackers. I really valued the cookieless approach and more control over exactly what I wanted to be tracked. It allowed me to me more privacy concious for my users.

    images:
      - src: "@portfolio/kokonekoart-portfolio.png"
        alt: Rough wireframes for two slides of my portfolio case studies, redesigned for the rebuilt portfolio site.
  - title: Commission Estimate Calculator
    content: |
      This part of my project is one of my proudest achievements. I had always built my commission prices to scale depending on how finished they were, but previous platforms like [Ko-Fi](https://ko-fi.com/kokonekogirl) were awkward to use with the add-ons feature. I built the first version in my [art commission prototype](/portfolio/kokonekoart-prototype) and expanded on it here.

      The custom rules and the different ways other add-ons replace selections was a challenge. For example, the Referance Sheet add-on is 2 Flat Fullbodies and a Flat Headshot, so it had to remove the Character Finish and Shot. The experience had to feel obvious and user friendly. I'm glad I was able to get some user feedback on this aspect of the project, since I aimed to increase customer conversion.

      When moving to WordPress, I knew I wanted to have a commission form for easier payments. I also discovered Forminator had the ability for query URLs, which gave me the idea to prefill the commission form based on what the customer selected. It was a challenge to format the request URL just right for the form to fill in effectively.

      Refactoring my commission calculator into an Astro instance was also a challenge. I knew I wanted to have everything in its own data TypeScript file, since I heavily dislike having to update code in multiple places, it's why ACF in WordPress is one of my favourite plugins. Figuring out how mapping TypeScript data worked was really interesting and gave me the challenge I was looking for. I used this same single data mindset for my about information and social links as well. 
  - title: What I Learned
    content: |
      I've learned a lot since the start of this project. Building my architecture with reusable components and exporting those components into a barrel file was a game changer. It was so much fun to have these complex, dynamic components but only insert the data and content once. It was exactly what I was looking for in a static instance. I had no idea that static deployments could be this dynamic.

      Auditing which libraries I needed and which plugins I rebuilt was another challenge. Replacing custom fields for typed, validated collections was the fun part. I also had to modify my slider content to enable swiper initiation, add in SEO meta and maintain optimization myself, and completely rebuild my payment and contact forms from Forminator. I followed documentaion and researched all I could for the backend functionality. I feel I understand the frontend more than the backend.

      I had a lot of fun building this project and tailoring my own needs into something I could actively deploy and continue to build upon. I'm confident I could apply my learned experience to a future client project someday.

finalText: "Well, you’re looking at it! ≽^•⩊•^≼"
links:
  github: https://github.com/KokoTheNekoGirl/kokonekoart-rebuilt
  site: https://kokoneko.art
finalNote: This current site is live and version controlled, receiving continuous content updates and improvements.

# if you're seeing this before it's live, hello :3
---

**Roles:** Artist, Designer, & Developer

**Current Stack:** Astro, TypeScript, SCSS, Markdown/MDX, Barrel Files, Swiper.js, accessible-astro-components, Vercel & Serverless Functions, PayPal REST API, Google reCAPTCHA v3, Resend (Email API), Umami Analytics, WordPress Migration

**Features:** Semantic HTML, Keyboard Navigation, prefers-reduced-motion Support, Screen Reader Announcements and a no-JavaScript Fallback, Image and SEO Optimization, Typed Content, Single Source Files, Structured Data, Static Output, AJAX Contact & Commission Forms, Server-side Price Validation, Bot Protection (reCAPTCHA & Honeypot), Privacy-first Cookieless Analytics, Font & CSS Optimization