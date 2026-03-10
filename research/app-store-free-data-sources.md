# Free Data Sources for Apple App Store Analytics
# Research Report — March 2026

---

## 1. Apple Marketing Tools RSS Feed (Primary Free Source)

**Status: Active, no auth required, completely free**

### Base URL Pattern
```
https://rss.marketingtools.apple.com/api/v2/{country}/{media}/{chart-type}/{limit}/{format}.json
```

### Confirmed Working Endpoints

| Chart Type | URL |
|------------|-----|
| Top Free Apps | `https://rss.marketingtools.apple.com/api/v2/us/apps/top-free/100/apps.json` |
| Top Paid Apps | `https://rss.marketingtools.apple.com/api/v2/us/apps/top-paid/100/apps.json` |

- **Country**: Any ISO 3166-1 alpha-2 code (us, gb, jp, de, fr, kr, etc.)
- **Limit**: 10, 25, 50, or 100 (100 is confirmed maximum)
- **Format**: json, xml (RSS), xml (Atom)
- **Media types**: apps, music, podcasts, books, audiobooks

### Fields Returned Per App Entry
```json
{
  "artistName": "OpenAI OpCo, LLC",
  "id": "6448311069",
  "name": "ChatGPT",
  "releaseDate": "2023-05-18",
  "kind": "apps",
  "artworkUrl100": "https://...",
  "genres": [{"genreId": "...", "name": "..."}],
  "url": "https://apps.apple.com/us/app/..."
}
```

Feed metadata also includes: title, author, copyright, lastUpdated, icon.

### Category Filtering (Genre)
The v2 API currently returns empty `genres` arrays — category filtering via query param is NOT functional in the v2 endpoint. For category-specific charts, use the legacy endpoint below.

### Legacy Category-Filtered URL (Still Working)
```
https://itunes.apple.com/us/rss/topfreeapplications/limit=100/genre={genreId}/json
```

Key genre IDs for apps:
- 36 = Games
- 6000 = Business
- 6001 = Weather
- 6002 = Utilities
- 6003 = Travel
- 6004 = Sports
- 6005 = Social Networking
- 6006 = Reference
- 6007 = Productivity
- 6008 = Photo & Video
- 6009 = News
- 6010 = Navigation
- 6011 = Music
- 6012 = Lifestyle
- 6013 = Health & Fitness
- 6014 = Games (alternate)
- 6015 = Finance
- 6016 = Entertainment
- 6017 = Education
- 6018 = Books
- 6020 = Medical
- 6021 = Magazines & Newspapers
- 6022 = Catalogs
- 6023 = Food & Drink
- 6024 = Shopping

---

## 2. iTunes Search API

**Status: Free, no auth required, ~20 req/min rate limit**

### Base Endpoints
```
https://itunes.apple.com/search?term={query}&media=software&entity=software&country=us&limit=200
https://itunes.apple.com/lookup?id={trackId}&country=us
https://itunes.apple.com/lookup?bundleId={bundleId}
```

### Key Parameters
| Parameter | Values | Notes |
|-----------|--------|-------|
| term | string | URL-encoded search query |
| country | ISO 3166-1 | Required |
| media | software, music, podcast, movie, tvShow, ebook, all | Use "software" for apps |
| entity | software, iPadSoftware, macSoftware | Sub-filter for app type |
| limit | 1–200 | Max 200 results |
| lang | en_us, ja_jp | Language for results |
| explicit | Yes / No | Filter explicit content |

### Fields Returned Per App (Lookup Response)
Complete field list confirmed from live API:
- `trackId` — numeric App Store ID
- `bundleId` — reverse-DNS bundle identifier (com.example.app)
- `trackName` — app title
- `artistId` / `artistName` — developer ID and name
- `artworkUrl60`, `artworkUrl100`, `artworkUrl512` — icon URLs
- `price` / `currency` / `formattedPrice`
- `description`
- `version` — current version string
- `currentVersionReleaseDate` / `releaseDate`
- `releaseNotes`
- `averageUserRating` — overall average rating (0.0–5.0)
- `userRatingCount` — total ratings count (lifetime)
- `averageUserRatingForCurrentVersion`
- `userRatingCountForCurrentVersion`
- `primaryGenreId` / `primaryGenreName`
- `genreIds` / `genres` — array of all categories
- `trackViewUrl` — App Store URL
- `minimumOsVersion`
- `fileSizeBytes`
- `contentAdvisoryRating` (e.g., "12+")
- `advisories` — array of content warnings
- `screenshotUrls` / `ipadScreenshotUrls`
- `supportedDevices` — array of device identifiers
- `features` (e.g., ["iosUniversal"])
- `isVppDeviceBasedLicensingEnabled`
- `languageCodesISO2A`
- `kind` — always "software"
- `wrapperType` — always "track"

### Rate Limits
~20 requests/minute per IP. Returns HTTP 429 on excess. No official published SLA. No API key needed.

### Important: What's Missing
- No historical ratings/rankings data
- No download estimates
- No revenue estimates
- No keyword rankings
- No review sentiment over time

---

## 3. App Store Connect API

**Status: Requires Apple Developer account ($99/year) + app ownership**

This API is NOT publicly accessible. Key facts:
- Requires a paid Apple Developer Program membership
- API keys can only be created by the Account Holder
- Returns data ONLY for apps you own/manage
- Provides 50+ detailed analytics reports (installs, sessions, crashes, retention, etc.)
- Not usable for a public-facing trend site about arbitrary apps

**Verdict: Not usable for your use case.**

---

## 4. Undocumented / Reverse-Engineered Apple APIs

### 4a. iTunes WebObjects Chart API (Higher Limits)
```
https://itunes.apple.com/WebObjects/MZStore.woa/wa/topChartFragmentData?cc={country}&genreId={genreId}&pageSize=100&popId={chartType}&pageNumbers=0
```
- `popId=27` = Top Free
- `popId=30` = Top Paid
- `popId=38` = Top Grossing
- Requires header: `X-Apple-Store-Front: {storefrontId}` (e.g., `143441-1,32` for US)
- Previously returned 1,500 apps; now capped at ~100
- Fragile — could break without notice

### 4b. Apple AMP API (App Detail + Privacy Labels)
```
https://amp-api.apps.apple.com/v1/catalog/{country}/apps/{appId}?platform=iphone&additionalPlatforms=appletv
```
- Returns richer app metadata including privacy labels
- Requires a Bearer JWT token (extractable from Apple's JS bundles)
- Token is short-lived; must be refreshed periodically
- Used by parse-tunes library (see Section 8)
- Fragile — reverse-engineered, not officially documented

---

## 5. Apple App Store Sitemaps (Scraping-Friendly)

Apple publishes public XML sitemaps at:

```
https://apps.apple.com/sitemaps_apps_index_app_1.xml      — all apps
https://apps.apple.com/sitemaps_apps_index_chart_1.xml     — chart pages
https://apps.apple.com/sitemaps_apps_index_new-app_1.xml   — new apps
https://apps.apple.com/sitemaps_apps_index_story_1.xml     — App Store stories
```

The chart sitemap index links to 7 compressed `.xml.gz` files with all chart page URLs. These are Google-friendly and reflect what Apple considers indexable.

**robots.txt at apps.apple.com blocks:**
- `/WebObjects/*`
- `/api/*`
- `/includes/*`
- `/v1/*`
- `*/search?*`

Individual app pages (`/us/app/name/idXXXXXX`) are NOT blocked and can be scraped for metadata not in the APIs (though Apple ToS applies).

---

## 6. Competitor Free Tiers

### AppFollow (appfollow.io)
- **Free plan**: Track 2 apps, 2 countries, 20 keywords
- **Data available free**: Reviews, ratings, keyword tracking, Slack/email integrations, 100 API requests/day
- **Not free**: Competitor tracking, bulk keyword analysis, full chart history
- **10-day trial** for paid features

### Sensor Tower (sensortower.com)
- **Free tier**: Top Charts browsing, basic App Profiles, Featured Apps view
- **Not free**: Download/revenue estimates, keyword intelligence, ad intelligence
- **Pricing**: Enterprise-only ($25K–$40K/yr) — effectively unusable for independent devs

### AppMagic (appmagic.rocks)
- Estimates revenue/downloads from chart position data
- Has a limited free search feature for public app data
- Paid plans required for bulk/historical data

### MobileAction
- Free trial available; features include keyword data (6M+ keywords), ad intelligence
- Limited free tier — most useful data requires subscription

### ASOMobile, AppRadar, AppTweak
- All offer free trials (7–14 days) but no meaningful permanent free tier

**Verdict for your site**: None of these offer programmatic free data access. Use their sites as reference benchmarks, not data sources.

---

## 7. Google Trends for App Keywords

### Official Google Trends API (Alpha — 2025)
- Google launched an official Trends API in July 2025
- Currently in alpha with limited endpoints and quotas
- Docs: https://developers.google.com/search/apis/trends

### pytrends (Unofficial, Free)
- GitHub: https://github.com/GeneralMills/pytrends
- Pseudo-API scraping Google Trends web interface
- **Free, no API key needed**
- Rate limiting applies (Google will block aggressive crawling)

Available data via pytrends:
- `interest_over_time()` — indexed search volume over time
- `interest_by_region()` — geographic breakdown
- `related_topics()` — related topic entities
- `related_queries()` — related search terms
- `trending_searches()` — daily trending searches by country
- `top_charts()` — Google's own top charts by year/category

**Use case for your site**: Correlate App Store chart movements with Google search trend spikes for app names or categories.

### SerpApi Google Trends
- 100 free searches/month
- More reliable than pytrends but quickly exhausted at scale

---

## 8. GitHub Open Source Libraries to Build On

### app-store-scraper (Node.js) — RECOMMENDED
- Repo: https://github.com/facundoolano/app-store-scraper
- Methods: `app()`, `list()`, `search()`, `developer()`, `reviews()`, `ratings()`, `similar()`, `suggest()`, `versionHistory()`
- Uses iTunes Search API + App Store web pages under the hood
- Returns full app metadata including ratings, descriptions, screenshots, version history
- No auth required; widely used and maintained

### parse-tunes (TypeScript)
- Repo: https://github.com/tweaselORG/parse-tunes
- Fetches top charts via undocumented iTunes APIs (up to 200 apps)
- Also fetches privacy labels via amp-api.apps.apple.com
- More fragile due to reverse-engineered endpoints
- Good for privacy label data not available elsewhere

### itunes-app-scraper (Python)
- Repo: https://github.com/digitalmethodsinitiative/itunes-app-scraper
- Lightweight Python scraper; good for academic/research pipelines

### appler (R package)
- https://ashbaldry.github.io/appler/
- R interface to App Store data; useful for statistical analysis pipelines

### RSS-Bridge AppleAppStoreBridge
- Repo: https://github.com/RSS-Bridge/rss-bridge
- Bridges App Store feeds into standard RSS

---

## 9. Data Freshness and Update Frequency

| Source | Update Frequency | Historical Data |
|--------|-----------------|-----------------|
| RSS Marketing Tools API | Real-time (reflects current charts) | No — current snapshot only |
| iTunes Search API (lookup) | Near real-time for app metadata | No — current state only |
| app-store-scraper reviews | Real-time fetch | Paginated, ~500 reviews max |
| Google Trends (pytrends) | Daily/weekly granularity | Up to 5 years back |
| App Store sitemaps | Periodically by Apple | No |

---

## 10. Recommended Architecture for Your Site

### Tier 1: Completely Free, Reliable
- **Apple RSS Marketing Tools API** for daily chart snapshots (top 100 free/paid per country)
- **iTunes Search API** for app metadata enrichment (icon, description, ratings, version)
- **Legacy genre RSS** for category-specific charts

### Tier 2: Free with Caution (Fragile)
- **iTunes WebObjects chart API** for deeper charts (up to 200 apps, all genres)
- **pytrends** for keyword/app name trend correlation

### Tier 3: Infrastructure Needed
- Store daily RSS snapshots in a database to build historical ranking trends
- Diff snapshots daily to detect chart movers (new entries, rank changes)
- This is what competitor sites pay for — you can replicate it for free by persisting data yourself

### What You Cannot Get Free
- Download/install estimates
- Revenue estimates
- Keyword search volume within App Store
- Ad spend intelligence
- Detailed crash/performance analytics
- Any data from non-public apps

---

## Sources

- [Apple RSS Feed Generator](https://rss.marketingtools.apple.com/)
- [iTunes Search API Documentation](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html)
- [iTunes Search API — Constructing Searches](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/Searching.html)
- [iTunes Search API — Lookup Examples](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/LookupExamples.html)
- [App Store Connect Analytics API](https://developer.apple.com/documentation/appstoreconnectapi/analytics)
- [parse-tunes GitHub](https://github.com/tweaselORG/parse-tunes)
- [app-store-scraper GitHub](https://github.com/facundoolano/app-store-scraper)
- [apps.apple.com robots.txt](https://apps.apple.com/robots.txt)
- [AppFollow Free Plan Details](https://support.appfollow.io/hc/en-us/articles/360020979798-Free-Plan)
- [pytrends GitHub](https://github.com/GeneralMills/pytrends)
- [Google Trends API Alpha](https://developers.google.com/search/apis/trends)
- [parse-tunes top chart issue discussion](https://github.com/tweaselORG/parse-tunes/issues/2)
- [iTunes RSS Gist](https://gist.github.com/iggym/6023041)
