# Case Study: Kotoba Dojo POC – Spaced-Repetition Flashcard App for Japanese Learning

## Discovery

The Kotoba Dojo is a proof-of-concept (POC) flashcard app built for busy beginner (JLPT N5) learners who need a frictionless, bite-sized way to build and maintain core vocabulary. It removes setup barriers with zero-login onboarding, delivers pre-curated topic decks of 10–20 high-frequency words, and offers user-friendly card creation tied to a lesson number or topic. Each card shows only the Japanese (kanji/kana), furigana, and translation in a simple UI.

Primary persona

Beginner Learner (JLPT N5)
* Studies in 5–15 minute sessions at home or on the go
* Frustrated by too many resources, long decks, manual card creation
* Wants simple, topic-focused word sets and minimal card formatting
* Needs fast retention boosts without overwhelming features


### Learner Context
* Where and when they study: Home, commutes, brief breaks between classes or work. Often switching between physical textbooks, PDF textbooks on laptop, and handwritten notes
* Device preferences:
- Smartphones for quick sessions on the go
- Laptops/tablets for longer at-home study
* Goals:
- Quickly build a core set of high-utility vocabulary and simple kanji
- Recognise basic kanji on signs and product packaging
- Retain and recall words long enough to use them in class or real-world situations
* Constraints
- Limited uninterrupted study time (5–15 minutes per session)
- Low tolerance for complex setup or information overload
- Preference for a minimal, focused interface


## Jobs to Be Done (JTBD):

* When I have a short break, I want 10–20 essential words on a topic so I can learn without feeling overwhelmed.
* When I study vocabulary, I want a simple flashcard—just the Japanese, furigana, and translation—so I can stay focused.
* When I finish a session, I want to quickly flag hard words or re-study them immediately so I don’t forget.
* When choosing what to learn next, I want clear list sizes (e.g., “12 words”) and estimated time so I can pick what fits my schedule.
* When I’m preparing for a specific lesson, I want to bulk-create flashcards by entering each word, its translation, and the lesson number, so I can study exactly the vocabulary I’ll need without extra setup.


### Pain Points:
- Existing tools like Anki require manual setup and deck management, which is intimidating for beginners.
- Apps like Duolingo are gamified but lack depth for serious learners, while WaniKani focuses only on kanji.
- Creating cards by hand takes longer than studying.
- New words vanish from memory within days.
- Too many resources and word lists; it’s hard to find simple, popular, topic-specific vocabulary.
- Large or overly detailed word lists intimidate beginners.
- Missing furigana or romaji forces extra lookups.
- Flashcards overloaded with audio, images, or sentences become distracting.

## Strategy
### Positioning vs. Competitors

| Competitor | Pain Point | Kotoba Dojo Solution |
| :-- | :-- | :-- |
| Anki | Steep learning curve, manual deck setup | Preloaded, curated decks + user-friendly card creation |
| WaniKani | Kanji-only focus, rigid progression | Vocabulary + kanji at N5, study any order |
| Duolingo | Gamified but shallow, no furigana or romaji, no SRS | SM-2 spaced repetition, simple cards with furigana |
| Mochi | Requires manual imports, too many settings to tweak | Instant in-app decks, zero imports, minimal UI |
| Hand-written cards | Writing takes too long, easy to lose or misplace | Fully digital, mobile-ready, inline “difficult” tagging |
| Quizlet | Inconsistent user lists, no true SRS, overly long decks | Curated 10–20 word sets by topic + SM-2 scheduler |
| Memrise | Distracting videos, memes, and extra content | Focus-only view: word, furigana, translation |
| Brainscape | Heavy subscription, complex interval settings, no curation | Free POC, zero-setup topics, fixed daily/new limits |

## Scope Choices and Trade-offs

- Single-User POC: The decision to exclude authentication and multi-user support simplifies development and allows focus on core functionality. This trade-off limits scalability but accelerates time-to-market.
- Backend-First Approach: Prioritizing the FastAPI backend ensures robust scheduling and queue-building logic, but the frontend may lack advanced interactivity in the POC phase.
- SM-2 Algorithm: By adhering strictly to the SM-2 algorithm, the app ensures proven retention outcomes but sacrifices flexibility for users who prefer custom scheduling.
- Daily Limits: Implementing daily review/new card limits (15 new cards, 200 reviews) balances user workload but may frustrate high-intensity learners.

## Measurement

### North Star Metric
• Weekly Review Completion Rate: % of active users who finish at least 4 review sessions/week

This metric reflects user engagement, habit formation, and the app's ability to deliver value consistently.

### Supporting Metrics

Onboarding Metrics:
* Time to First Review Session – seconds from app launch to the appearance of the first card
* Time to First Custom Card  – seconds from app launch to completion of a lesson-based card batch
* Onboarding Completion Rate – percentage of new users who reach their first review session


Engagement Metrics:
*  Daily Active Users (DAU) - percentage of users completing at least one review session per day
* Session Completion Rate - percentage of review sessions in which users finish the full deck of words
*  Preloaded Deck Adoption - percentage of sessions that start with starter decks

Retention Metrics:
*  7-Day Retention Rate - percentage of users returning within seven days of first use
*  Card Retention Rate - percentage of cards correctly recalled one week after introduction

## Experimentation

### Hypothesis 1: Preloaded Decks Increase Adoption

* Test: A/B-test
– Group A sees 5 pre-curated 10–20-word decks on first open
– Group B must tap “Browse Topics” then choose
* Metric: Onboarding Completion Rate (reach first card)
* Expected Result: Group A’s completion rate is ≥ 30% higher than Group B

### Hypothesis 2: Dark Mode Increases Usability

* Test: A/B-test,, roll out Dark Mode to 50% of active users, leave 50% on Light Mode
* Metrics:
– Average Session Duration in low-light usage windows
– Self-reported Ease-of-Use score in a quick post-session survey
* Expected Result: Dark Mode users show ≥ 15% longer sessions after sunset and a 10-point higher Ease-of-Use rating than Light Mode users

## Product Requirements Document

- See the full product requirements and phased roadmap in `PRD.MD`.