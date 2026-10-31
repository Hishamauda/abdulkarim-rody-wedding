# QA (local) — http://127.0.0.1:8765/

**90/90 checks passed** — 2026-10-31T14:25:09.537Z

| Group | Check | Result | Detail |
|---|---|---|---|
| 360px | Envelope scene visible on load | ✅ |  |
| 360px | Content inert before opening | ✅ |  |
| 360px | Envelope opens and is removed | ✅ |  |
| 360px | Content interactive after opening | ✅ |  |
| 360px | Focus moved to names heading | ✅ |  |
| 360px | Names writing animation runs | ✅ | write, sheen |
| 360px | Couple names fully inside the viewport (not clipped) | ✅ | [[73,287],[171,189],[95,265]] |
| 360px | No horizontal scrolling | ✅ | scrollWidth 360 / viewport 360 |
| 360px | No console errors | ✅ |  |
| 360px | All assets loaded (no 4xx/5xx) | ✅ |  |
| 360px | Touch targets ≥ 44×44 px | ✅ |  |
| 390px | Envelope scene visible on load | ✅ |  |
| 390px | Content inert before opening | ✅ |  |
| 390px | Envelope opens and is removed | ✅ |  |
| 390px | Content interactive after opening | ✅ |  |
| 390px | Focus moved to names heading | ✅ |  |
| 390px | Names writing animation runs | ✅ | write, sheen |
| 390px | Couple names fully inside the viewport (not clipped) | ✅ | [[79,311],[186,204],[103,287]] |
| 390px | No horizontal scrolling | ✅ | scrollWidth 390 / viewport 390 |
| 390px | No console errors | ✅ |  |
| 390px | All assets loaded (no 4xx/5xx) | ✅ |  |
| Performance | Total transfer size (390px run) | ✅ | 379 KB |
| 390px | Touch targets ≥ 44×44 px | ✅ |  |
| 430px | Envelope scene visible on load | ✅ |  |
| 430px | Content inert before opening | ✅ |  |
| 430px | Envelope opens and is removed | ✅ |  |
| 430px | Content interactive after opening | ✅ |  |
| 430px | Focus moved to names heading | ✅ |  |
| 430px | Names writing animation runs | ✅ | write, sheen |
| 430px | Couple names fully inside the viewport (not clipped) | ✅ | [[87,343],[205,225],[114,316]] |
| 430px | No horizontal scrolling | ✅ | scrollWidth 430 / viewport 430 |
| 430px | No console errors | ✅ |  |
| 430px | All assets loaded (no 4xx/5xx) | ✅ |  |
| 430px | Touch targets ≥ 44×44 px | ✅ |  |
| 768px | Envelope scene visible on load | ✅ |  |
| 768px | Content inert before opening | ✅ |  |
| 768px | Envelope opens and is removed | ✅ |  |
| 768px | Content interactive after opening | ✅ |  |
| 768px | Focus moved to names heading | ✅ |  |
| 768px | Names writing animation runs | ✅ | write, sheen |
| 768px | Couple names fully inside the viewport (not clipped) | ✅ | [[377,627],[344,372],[141,339]] |
| 768px | No horizontal scrolling | ✅ | scrollWidth 768 / viewport 768 |
| 768px | No console errors | ✅ |  |
| 768px | All assets loaded (no 4xx/5xx) | ✅ |  |
| 768px | Touch targets ≥ 44×44 px | ✅ |  |
| 1440px | Envelope scene visible on load | ✅ |  |
| 1440px | Content inert before opening | ✅ |  |
| 1440px | Envelope opens and is removed | ✅ |  |
| 1440px | Content interactive after opening | ✅ |  |
| 1440px | Focus moved to names heading | ✅ |  |
| 1440px | Names writing animation runs | ✅ | write, sheen |
| 1440px | Couple names fully inside the viewport (not clipped) | ✅ | [[696,1109],[663,691],[331,658]] |
| 1440px | No horizontal scrolling | ✅ | scrollWidth 1440 / viewport 1440 |
| 1440px | No console errors | ✅ |  |
| 1440px | All assets loaded (no 4xx/5xx) | ✅ |  |
| 1440px | Touch targets ≥ 44×44 px | ✅ |  |
| Content | Every approved Arabic text is present verbatim | ✅ |  |
| Content | Parents’ names and kunyas exact | ✅ |  |
| Content | No gifts / payments / bank / wallet / QR anywhere | ✅ |  |
| Content | All bound texts equal config.js | ✅ | [] |
| Date | Ceremony start = 12-11-2026 16:00 Asia/Gaza (14:00 UTC) | ✅ | 2026-11-12T14:00:00.000Z |
| Date | Day of the week is Thursday (الخميس) | ✅ | الخميس |
| Date | Numeric date isolated LTR (cannot flip to 2026-11-12) | ✅ | ltr 12-11-2026 |
| Countdown | Live countdown matches time to 16:00 Gaza | ✅ | 11:23:35:13 (expected days 11) |
| Countdown | Countdown ticks every second | ✅ | 13 → 12 |
| Timeline | 4 approved timeline entries in order | ✅ | 4:00 مساءً بداية مراسم حفل الزفاف / 4:30 مساءً دخول العروسين / 5:00 مساءً مراسم تبديل المحابس / 5:15 مساءً فقرات حفل الزفاف |
| Timeline | Gold line lights up progressively while scrolling | ✅ | --p 0.66 → 1.00, lit 4 |
| Venue | Google Maps opens a text search for the venue (no invented coordinates) | ✅ | https://www.google.com/maps/search/?api=1&query=قاعة روفان، بجوار برج الشفاء، غزة |
| Calendar | Save-the-date menu opens | ✅ |  |
| Calendar | Google Calendar link has the right UTC times | ✅ | https://calendar.google.com/calendar/render?action=TEMPLATE&text=%D8%B2%D9%81%D8%A7%D9%81%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20%26%20%D |
| Calendar | .ics file served and correct | ✅ | 200 text/calendar |
| Share | Without Web Share API the link is copied + confirmation toast | ✅ | تم نسخ رابط الدعوة / https://hishamauda.github.io/abdulkarim-rody-wedding/ |
| Navigation | Bottom nav scrolls to the programme | ✅ |  |
| Navigation | Active nav item announced (aria-current) | ✅ | location |
| Navigation | Bottom nav scrolls to the venue | ✅ |  |
| Music | Music toggles (started by the guest’s tap on “open”, button switches it) | ✅ | true → false |
| Console | No console errors during functional run | ✅ |  |
| Share | Web Share API used when available (title, text, url) | ✅ | {"title":"عبد الكريم & رودي — دعوة زفاف","text":"يسعدنا دعوتكم لحفل زفاف عبد الكريم & رودي — الخميس 12 نوفمبر 2026، قاعة روفان.","url":"https://hishamauda.githu |
| Music | No music before the guest interacts | ✅ |  |
| Keyboard | Invitation opens with the keyboard (Enter on focused button) | ✅ |  |
| Keyboard | Tab reaches buttons, links and the bottom nav | ✅ | scroll-cue → mapsLink → calendarToggle → home → venue → program → shareButton → musicButton → BODY → skip-link → scroll-cue → mapsLink → calendarToggle → home |
| Keyboard | Visible focus indicator | ✅ | solid |
| Accessibility | prefers-reduced-motion: instant open, no masking/parallax | ✅ | [true,"none"] |
| Countdown | At 16:00 Gaza the countdown turns into the welcome message | ✅ | حان موعد الفرح... أهلاً بكم في ليلتنا. |
| Contrast | Espresso text on Ivory | ✅ | 14.05:1 (min 4.5) |
| Contrast | Soft text #5A4A3D on Pearl | ✅ | 7.40:1 (min 4.5) |
| Contrast | Gold-ink #8A6A35 small text on Ivory | ✅ | 4.72:1 (min 4.5) |
| Contrast | Gold-deep #6E5328 on Pearl | ✅ | 6.26:1 (min 4.5) |
| Contrast | Antique gold #A88348 (large display only) on Ivory | ✅ | 3.30:1 (min 3) |
| Contrast | Button text on gold-ink | ✅ | 4.93:1 (min 4.5) |
