# Problem–solution smoke test (landing page + waitlist)

https://kotobadojo.carrd.co/

## Hypothesis
If the landing page highlights “study-ready deck sizes with clear time estimates (5–15 minutes),” beginners will be more likely to click the primary CTA because it matches their constrained study windows and reduces decision fatigue.

A focused landing page communicating “memorise 12 essential words in 5 minutes” will convert qualified traffic to the waitlist at 12–18% (reasoning: cold community traffic to a POC).on.

## Value proposition
- Learn essential Japanese in minutes
- Curated N5 topic decks sized 10–20 words with clear time estimates so you can fit study into any break.
- Focus-only cards with Japanese, furigana, and translation - no clutter, no extra lookups.
- Start instantly preloaded decks on mobile or desktop. No registration, installation, imports or settings to tweak.
- Bulk-create your lesson vocab fast by entering word, translation, and lesson number - study exactly what you need.

## Success criteria
- From qualified traffic, Carrd → waitlist conversion: target 12–18%; minimum 8–10% to proceed to concierge MVP.
- Typeform completion rate (from waitlist sign-ups): target ≥50%; minimum 35%.
- Price willingness: ≥40% select “Would pay $3–5/month”; ≥20% select “$6–8/month”.
- Qualitative guardrail: ≥70% of respondents self-describe as N5 beginner and mobile usage ≥60%.
- Segment signal: “5-minute topic decks” variant converts ≥20% better than “SM-2 SRS” variant or vice versa (decide which to carry forward).
- Minimum sample: 150 qualified Carrd visitors, 20–30 completed Typeforms, 10 booked chats.

## Metrics to capture
- Visitors per source/variant (GA)
- Waitlist sign-ups (Mailchimp) per source/variant
- Typeform completes and drop-off by question
- Price willingness distribution from Q7.
- Segment breakdowns: level, device, topics chosen.
- Qualitative notes: top pain, objections, desired features, reasons for not paying.

## Decision rules
Proceed to concierge MVP if:
- Carrd → waitlist ≥8–10% from qualified traffic, and Typeform completion ≥35–50%.
- ≥40% indicate willingness to pay $3–5/month; ICP match ≥70%.

Iterate messaging/segment if:
- Conversion sits at 4–8% but one variant materially outperforms; double down on the winner and refine copy.

Pivot/stop if:
- <4% conversion from qualified traffic, Typeform completion <25%, price willingness <25%, or audience largely not N5.

## Experiment design

### Carrd landing page
- Headline:
  - Variant A: “Master 12 essential Japanese words in 5 minutes”
  - Variant B: “Beginner-friendly flashcards for popular topics”
- Sub-headline: “Curated topic decks of 10–20 high-frequency words with furigana and simple cards.”
- Problem section: “Too many lists, too much setup. Skip it and start learning in 💮 Kotoba Dojo.”
- Value bullets:
  - Themed bite-sized decks: 10–20 words, perfect for short sessions
  - Ready flashcard decks with useful topics: shopping, travel, family
- Social proof (lightweight): “Built with advice from JLPT N5 tutors”
- Price anchor: Not applicable
- Primary CTA button: “Join waitlist” → opens Typeform in modal or new tab.
- Secondary CTA button: Not applicable
- Trust footnote: “We’re inviting early learners to help shape the app. No spam, cancel anytime.”

### Typeform qualifier
- 6–8 questions taking around 2–3 minutes to answer
- Hidden fields: utm_source, utm_medium, utm_campaign, utm_content; pass through from Carrd link.
- Q1: What’s your current level of Japanese? [No level, I only know the alphabets, N5, N4, N3+, not sure]
- Q2: How long are your typical study sessions? [5 min, 10–15 min, 20+ min]
- Q3: Where do you study most? [Commute, at home, between classes/work]
- Q4: What’s your preferred device for studying? [Phone, Laptop/Tablet, Both]
- Q5: What’s your biggest pain with vocab now? [Too much setup, long/uncurated lists, missing furigana, distracting features, forget words quickly]
- Q6: Pick 2 topics you’d start with: [Food, Transport, Classroom, Daily life, Shopping, Numbers/dates, Other]
- Q7: Email capture + consent checkbox for early access contact.
- Thank-you screen: “Thanks! We’ll send a concept tour and a link to a 5-minute mock session. We’re also inviting a few testers to a quick 10-minute chat.”

### Mailchimp
- Email 1 (immediately): Concept tour + 5‑minute mock session
  - Subject: “Kotoba Dojo POC: try a 5‑minute mock session”
  - Body (short, transparent):
    - “We’re testing a beginner‑friendly vocab app: curated 10–20 word topic decks and simple cards with furigana”
    - “There’s no app yet - just a concept preview and a 5‑minute mock session to see if this fits your study routine.”
  - CTA 1: “View concept” → Carrd page with static screenshots/mocks
  - CTA 2 (primary): “Try the 5‑minute mock session” → Typeform that simulates a mini study flow with 8–12 sample cards (static images/text), plus 3 quick questions
  - Transparency: “POC test: no downloads, no charges, fully free”
- Email 2 (Day 2): 30‑second follow‑up
  - Subject: “Was 10–20 words the right size?”
  - Body: “Two questions to calibrate deck size and topics.”
  - CTA: “Answer 2 questions” → micro Typeform (deck size preference, top topic)
- Email 3 (Day 4): Invite to a 10–15 minute preview chat
  - Subject: “Join our N5 preview chat (10 minutes)”
  - Body: “Help us shape the first curated decks and intervals. Quick call—no app required.”
  - CTA: “Book a 10–15 min chat” → scheduling link (or mailto), UTM‑tagged

### Google Analytics instrumentation
- GA4 on Carrd:
  - Events to configure: click_waitlist (Typeform button), click_free_decks (Mailchimp form submit), form_submit_success (via thank-you redirect URL with ?submitted=true).
  - Conversion events: click_waitlist, typeform_complete (via Typeform redirect to Carrd “thank-you” page), booked_chat_click (link click to scheduling or mailto).
  - Attribution: Ensure all outbound links include the UTM chain; configure GA4 to read utm_source/medium/campaign/content.
  - Filters: Exclude your IP; check bot filtering.

### UTM links
- Base: utm_campaign=smoke1
- Sources: reddit, discord, fbgroup, email, direct
- Mediums: community, social, email
- Content: headlineA, headlineB
- Examples:
  - https://form.typeform.com/to/cjmImKbU?utm_source=reddit&utm_medium=community&utm_campaign=smoke1&utm_content=cta_bottom_join_waitlist&variant=headlineA
  - https://form.typeform.com/to/cjmImKbU?utm_source=reddit&utm_medium=community&utm_campaign=smoke1&utm_content=cta_top_join_waitlist&variant=headlineA

## Traffic and recruitment plan

### Organic, low-cost
- Channels (for all need to be transparent about POC and invite testers):
  - Reddit: r/LearnJapanese weekly resources/feedback threads;
  - Discord: Beginner Japanese learning servers in “resources” channels
  - Facebook groups: JLPT N5/N4 learner groups; concise post with UTM links.
  - Personal network: Tutors or classmates; email with UTM link.
- Post (short, transparent):
  - “POC: Built for N5 beginners with 5–15 minute sessions. No setup, curated 10–20 word topic decks with furigana. Looking for 20 testers. Get early access: [Carrd link with UTMs].”
- Expected volume:
  - Reddit + Discord posts: 150–250 visitors over 7–10 days if posted thoughtfully.
  - Facebook groups: 50–100 visitors.
  - Email/personal outreach: 20–40 visitors.

## Plan
- Day 1–2: Build Carrd page, GA, Mailchimp audience/automation, Typeform
- Day 3: Dry run; test UTMs and event tracking; finalise the setup
- Day 4–10: Post to communities; monitor daily; adjust copy if response is poor
- Day 11–13: Conduct 10–15 minute chats; send follow-ups; gather qualitative notes
- Day 14: Analyse metrics; decide next step