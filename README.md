![Status](https://img.shields.io/badge/Status-Finished-8A2BE2?labelColor=2E2E2E)
![Course](https://img.shields.io/badge/Course-SOFT210%20React%20Native-8A2BE2?labelColor=2E2E2E)
![Language](https://img.shields.io/badge/Language-TypeScript-8A2BE2?labelColor=2E2E2E)
![Duration](https://img.shields.io/badge/Duration-Objective%201%20to%20Final-8A2BE2?labelColor=2E2E2E)
![Program](https://img.shields.io/badge/Program-Software%20Development%20Pathway-8A2BE2?labelColor=2E2E2E)
![Focus](https://img.shields.io/badge/Focus-Mobile%20UI%2C%20Routing%2C%20Lifecycle%2C%20Persistence%2C%20Web%20Services-8A2BE2?labelColor=2E2E2E)
![Final Project](https://img.shields.io/badge/Final%20Project-myDefendtheParksApp-8A2BE2?labelColor=2E2E2E)
![Interface](https://img.shields.io/badge/Interface-Mobile%20App-8A2BE2?labelColor=2E2E2E)

# Learning React Native - SOFT210 Portfolio by mp3li

This repository documents coursework for **SOFT210 Mobile Application Development (Expo React Native)**.  
It is organized as an objective-based portfolio showing progression from responsive mobile UI and navigation basics to state persistence, lifecycle-aware behavior, and a final API-driven mobile application.

### What This Portfolio Shows:
- Objective-by-objective mobile development progress
- Expo React Native app architecture using TypeScript
- Multi-screen navigation and route-based screen flow
- Data management with React state and AsyncStorage
- API integration with real public web services
- Final project delivery with documentation and testing workflow

--------------------------------------------------

### Table of Contents:
<details>
<summary><em>Open Table of Contents</em></summary>

- [Portfolio Summary](#portfolio-summary)
- [How to Run Projects](#how-to-run-projects)
- [Objective Portfolio (All Objectives)](#objective-portfolio-all-objectives)
  - [Objective 1 - Responsive UI and Accessibility](#objective-1---responsive-ui-and-accessibility)
  - [Objective 2 - React Router in Typescript](#objective-2---react-router-in-typescript)
  - [Objective 3 - Lifecycle-Aware UI in React Native Part 1](#objective-3---lifecycle-aware-ui-in-react-native-part-1)
  - [Objective 4 - State Persistence and Error Resilience in React Native](#objective-4---state-persistence-and-error-resilience-in-react-native)
  - [Objective 5 - SQLite Schema, Migrations, and CRUD](#objective-5---sqlite-schema-migrations-and-crud)
  - [Final Project - Mobile Application Development](#final-project---mobile-application-development)
- [Skills Demonstrated Across the Full Course](#skills-demonstrated-across-the-full-course)
- [Notes](#notes)

</details>

--------------------------------------------------

### Portfolio Summary:
<details>
<summary><em>Open Portfolio Summary</em></summary>

- Course: **SOFT210 Mobile Application Development**
- Repository purpose: Store and present objective-based Expo React Native coursework
- Primary working app (Objectives 1-5): `learning-react-native-app/`
- Final project app copy: `myDefendtheParksApp - Final Project/learning-react-native-app/`
- Structure:
  - Objective prompt files in repository root
  - App code folders for implementation
  - Final project folder containing objective prompt + final app + final README
- Final deliverable:
  - A complete multi-screen mobile app using external APIs and persistent saved data

</details>

--------------------------------------------------

### How to Run Projects:
<details>
<summary><em>Open How to Run Projects</em></summary>

- Objective app (Objectives 1-5):
  - `cd "learning-react-native-app"`
  - `npm install`
  - `npx expo start`
- Final project app:
  - `cd "myDefendtheParksApp - Final Project/learning-react-native-app"`
  - `npm install`
  - `npx expo start`
- Device targets:
  - Expo Go on physical device (QR scan)
  - iOS simulator (`i`)
  - Android emulator (`a`)
  - Web (`w`)
- Optional checks:
  - `npm run lint`
  - `npx tsc --noEmit`

</details>

--------------------------------------------------

### Objective Portfolio (All Objectives):

#### Objective 1 - Responsive UI and Accessibility
<details>
<summary><em>Open Objective 1 Details</em></summary>

- Objective focus:
  - Build responsive, accessible React Native UI patterns for mobile devices.
- Contains:
  - `Objective 1 - Responsive UI and Accessibility.txt`
  - `learning-react-native-app/` (implementation base)
- Implementation highlights:
  - Reusable themed components
  - Accessible labels and touch targets
  - Layout behavior adapted for small and larger device sizes

</details>

#### Objective 2 - React Router in Typescript
<details>
<summary><em>Open Objective 2 Details</em></summary>

- Objective focus:
  - Implement TypeScript-driven route navigation patterns.
- Contains:
  - `Objective 2 - React Router in Typescript.txt`
  - `learning-react-native-app/` route updates
- Implementation highlights:
  - Route-based screen transitions
  - Typed route parameters and navigation flow
  - Multi-screen organization for core app sections

</details>

#### Objective 3 - Lifecycle-Aware UI in React Native Part 1
<details>
<summary><em>Open Objective 3 Details</em></summary>

- Objective focus:
  - Use lifecycle-aware behavior to keep screen data current and stable.
- Contains:
  - `Objective 3 - Lifecycle-Aware UI in React Native Part 1.txt`
  - `learning-react-native-app/` lifecycle updates
- Implementation highlights:
  - Focus-aware refresh patterns
  - Improved data load/error experience
  - Better state transitions during navigation

</details>

#### Objective 4 - State Persistence and Error Resilience in React Native
<details>
<summary><em>Open Objective 4 Details</em></summary>

- Objective focus:
  - Persist user-facing data and improve resilience under failures.
- Contains:
  - `Objective 4 - State Persistence & Error Resilience in React Native.txt`
  - `learning-react-native-app/` state/persistence updates
- Implementation highlights:
  - Persistent data storage strategy
  - Error handling and fallback messaging
  - UX behavior for load/retry scenarios

</details>

#### Objective 5 - SQLite Schema, Migrations, and CRUD
<details>
<summary><em>Open Objective 5 Details</em></summary>

- Objective focus:
  - Practice local data modeling and CRUD operations with migration-aware structure.
- Contains:
  - `Objective 5 - SQLite Schema, Migrations, and CRUD .txt`
  - `learning-react-native-app/` Objective 5 implementation
- Implementation highlights:
  - SQLite-focused schema/migration workflow
  - CRUD-oriented data operations
  - Integration into app navigation and UI behavior

</details>

#### Final Project - Mobile Application Development
<details>
<summary><em>Open Final Project Details</em></summary>

- Objective focus:
  - Deliver a complete Expo React Native mobile app demonstrating course outcomes.
- Contains:
  - `myDefendtheParksApp - Final Project/Final Project - Mobile Application Development .txt`
  - `myDefendtheParksApp - Final Project/README.md`
  - `myDefendtheParksApp - Final Project/learning-react-native-app/`
- Implementation highlights:
  - Featured park of the day
  - All-50-state browsing and state-specific park lists
  - Park detail pages with National Park Service + Native Land data
  - Saved parks with persistent AsyncStorage state
  - Consistent app theming and refined mobile layout behavior

</details>

--------------------------------------------------

### Skills Demonstrated Across the Full Course:
<details>
<summary><em>Open Skills Demonstrated Across the Full Course</em></summary>

- Expo React Native app architecture
- TypeScript component and route typing
- Navigation and multi-screen UI design
- Lifecycle-aware refresh behavior
- Persistent data storage and retrieval
- API integration and response shaping
- Error handling and user feedback patterns
- Iterative mobile UX refinement
- Final-project packaging and documentation

</details>

--------------------------------------------------

### Notes:
<details>
<summary><em>Open Notes</em></summary>

- Objective prompts are preserved in the repository root for grading/reference.
- The final project is maintained in a dedicated folder to keep coursework and final delivery separated.
- For final-project specifics, see `myDefendtheParksApp - Final Project/README.md`.

</details>

--------------------------------------------------
