![Status](https://img.shields.io/badge/Status-Completed-8A2BE2?labelColor=2E2E2E)
![Course](https://img.shields.io/badge/Course-SOFT210%20React%20Native-8A2BE2?labelColor=2E2E2E)
![Language](https://img.shields.io/badge/Language-TypeScript-8A2BE2?labelColor=2E2E2E)
![Duration](https://img.shields.io/badge/Duration-Final%20Project-8A2BE2?labelColor=2E2E2E)
![Program](https://img.shields.io/badge/Program-Software%20Development%20Pathway-8A2BE2?labelColor=2E2E2E)
![Focus](https://img.shields.io/badge/Focus-Expo%20Router%2C%20APIs%2C%20AsyncStorage%2C%20Lifecycle-8A2BE2?labelColor=2E2E2E)
![Final Project](https://img.shields.io/badge/Final%20Project-myDefendtheParksApp-8A2BE2?labelColor=2E2E2E)
![Interface](https://img.shields.io/badge/Interface-Mobile%20App-8A2BE2?labelColor=2E2E2E)

# myDefendtheParksApp - Final Project by mp3li

This folder documents completed coursework for the **SOFT210 Mobile Application Development final project**.  
It is organized as a final-project portfolio artifact that delivers a full Expo React Native mobile app using public APIs.

### What This Portfolio Shows:
- End-to-end Expo React Native app delivery for a final objective
- Multi-screen mobile navigation with Expo Router / React Navigation
- Public API integration with National Park Service and Native Land Digital
- Park discovery by state, park detail pages, and a featured park of the day
- Persistent saved parks list using AsyncStorage
- Lifecycle-aware screen refresh behavior and resilient API error handling

--------------------------------------------------

### Table of Contents:
<details>
<summary><em>Open Table of Contents</em></summary>

- [Portfolio Summary](#portfolio-summary)
- [How to Run Projects](#how-to-run-projects)
- [Objective Portfolio (All Objectives)](#objective-portfolio-all-objectives)
  - [Final Project - Mobile Application Development](#final-project---mobile-application-development)
- [Skills Demonstrated Across the Full Course](#skills-demonstrated-across-the-full-course)
- [Notes](#notes)

</details>

--------------------------------------------------

### Portfolio Summary:
<details>
<summary><em>Open Portfolio Summary</em></summary>

- Course: **SOFT210 Mobile Application Development (Expo React Native)**
- Portfolio artifact: **Final project folder (`myDefendtheParksApp - Final Project`)**
- App concept: **A mobile app to explore U.S. national parks and learn Indigenous context tied to those lands**
- Required APIs used:
  - National Park Service API (`developer.nps.gov`)
  - Native Land Digital API (`native-land.ca`)
- Data management method used:
  - React state for in-session UI state
  - AsyncStorage for persisted saved parks data between app restarts
- Final deliverable:
  - A complete multi-screen mobile app with park browsing, detailed park profiles, indigenous context, and saved parks persistence

</details>

--------------------------------------------------

### How to Run Projects:
<details>
<summary><em>Open How to Run Projects</em></summary>

- Open terminal in this repository, then run the final app:
  - `cd "myDefendtheParksApp - Final Project/learning-react-native-app"`
  - `npm install`
  - `npx expo start`
- Test options:
  - Expo Go on physical phone (scan QR)
  - iOS simulator: press `i`
  - Android emulator: press `a`
  - Web preview: press `w`
- Optional checks:
  - `npm run lint`
  - `npx tsc --noEmit`

</details>

--------------------------------------------------

### Objective Portfolio (All Objectives):

#### Final Project - Mobile Application Development
<details>
<summary><em>Open Final Project Details</em></summary>

- Objective focus:
  - Demonstrate core mobile development principles using Expo React Native, including UI design, lifecycle behavior, persistence, and web service usage.
- Contains:
  - `Final Project - Mobile Application Development .txt`
  - `learning-react-native-app/` (final Expo React Native app)
- Features implemented:
  - Home screen with "Featured Park of the Day"
  - States screen with searchable list of all 50 states
  - State detail screen listing NPS parks alphabetically
  - Park profile screens with NPS + Native Land content
  - Saved Parks tab with add/remove and persistent storage
  - Image gallery with tap-to-enlarge modal
  - "Get Involved and Defend this Park" section with resource links
- Lifecycle handling implemented:
  - Refresh park content when park detail screen gains focus
  - Load persisted saved parks on startup and keep them synced
- Data management method used:
  - AsyncStorage (`@react-native-async-storage/async-storage`) for persistent saved data
  - React state/context for runtime app state and UI updates
- Challenges encountered:
  - Matching and presenting Indigenous context cleanly from variable API responses
  - Handling route transitions while preserving tab navigation and back behavior
  - Refining responsive spacing/scroll behavior across phone layouts

</details>

--------------------------------------------------

### Skills Demonstrated Across the Full Course:
<details>
<summary><em>Open Skills Demonstrated Across the Full Course</em></summary>

- Expo Router and React Navigation screen architecture
- Responsive React Native layout and component design
- API integration, async data loading, and error handling
- Lifecycle-aware refresh patterns with focus events
- Persistent storage with AsyncStorage
- Context-driven state management
- Mobile UX refinement and iterative usability improvements
- Final-project packaging and documentation for submission

</details>

--------------------------------------------------

### Notes:
<details>
<summary><em>Open Notes</em></summary>

- API keys are read from `.env` (`EXPO_PUBLIC_NPS_API_KEY`, `EXPO_PUBLIC_NATIVE_LAND_API_KEY`).
- App runs with standard Expo commands and is ready for instructor review.
- This README is the project summary file required by the final objective.

</details>

--------------------------------------------------
