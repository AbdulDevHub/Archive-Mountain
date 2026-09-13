# 🏔️ Mobile Mountain

**Mobile Mountain** is a collection of mobile development projects — spanning tutorials, codelabs, and more fully-featured builds — created while learning and exploring mobile app development.
The repo started as a Kotlin/Jetpack Compose learning log following [developer.android.com](https://developer.android.com), and has since grown to include any mobile-type project, including cross-platform apps built with React Native and Expo.

This repository is intended as:

* A personal learning log
* A reference for foundational and advanced mobile development concepts
* A showcase of progress from beginner tutorials to more structured, full-stack mobile apps

---

## 📱 Projects Included

### 1. **Happy Birthday**

A simple introductory app that displays a birthday message with an image.

**Concepts learned:**

* Basic composables
* Layouts and resources
* Images and text styling

---

### 2. **Greeting Card**

An extension of basic UI concepts with improved layout structure and styling.

**Concepts learned:**

* Compose layouts
* Reusable composables
* Theming basics

---

### 3. **Dice Roller**

An interactive app that simulates rolling a dice.

**Concepts learned:**

* State management in Compose
* Button click handling
* Conditional UI updates
* Drawable resources

---

### 4. **Lemonade**

A small state-driven app that walks through making lemonade step by step.

**Concepts learned:**

* App state machines
* Click-based state transitions
* Resource management

---

### 5. **Affirmations**

An app that displays a scrolling list of affirmations with images.

**Concepts learned:**

* Recycler-style lists (LazyColumn)
* Data models and data sources
* Separation of concerns
* Image and text lists

---

### 6. **Tip Calculator**

A utility app that calculates tip amounts based on user input.

**Concepts learned:**

* User input handling
* Formatting numbers
* Basic app logic
* UI feedback

---

### 7. **Recurrly**

A full-stack subscription management app built with React Native and Expo. Recurrly helps users track recurring expenses in one centralized hub, with active/inactive subscription tracking and automated email reminders so users never miss a billing date.

**Stack:** React Native, Expo, TypeScript, NativeWind, Node.js, Express, MongoDB, Clerk (auth), PostHog (analytics)

**Concepts learned:**

* Cross-platform mobile architecture with Expo
* Full-stack integration (mobile client + Node/Express/MongoDB backend)
* Authentication flows with Clerk
* Utility-first styling on mobile with NativeWind (Tailwind CSS)
* Product analytics with PostHog
* Native tab navigation
* Scheduled/automated notifications (email reminders)

> Built by following the [JavaScript Mastery](https://www.youtube.com/@javascriptmastery/videos) tutorial. See the project's own README for full setup instructions and environment variables.

---

## 🛠️ Tech Stack & Tools

**Native Android (Kotlin/Compose projects):**

* **Language:** Kotlin
* **UI Toolkit:** Jetpack Compose
* **Build System:** Gradle (Kotlin DSL)
* **IDE:** Android Studio

**Cross-platform (React Native projects):**

* **Language:** TypeScript
* **Framework:** React Native + Expo
* **Styling:** NativeWind (Tailwind CSS)
* **Backend:** Node.js, Express, MongoDB
* **Auth & Analytics:** Clerk, PostHog

**Architecture:** Simple, tutorial-driven structure, with some projects growing into more complete full-stack builds

---

## 📂 Repository Structure

* Each project is contained in its **own standalone directory**
* Projects can be opened independently (Android Studio for native projects, or `npm install && npx expo start` for React Native/Expo projects)
* Some projects include their own `README.md` with project-specific notes and setup instructions

---

## 🚀 How to Run a Project

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Mobile-Mountain.git
   ```

2. **For native Android projects:**
   * Open **Android Studio**
   * Select **Open** and choose the project folder (e.g., `DiceRoller`)
   * Let Gradle sync
   * Run on an emulator or physical device

3. **For React Native/Expo projects (e.g., `Recurrly`):**
   * `cd` into the project folder
   * Run `npm install`
   * Run `npx expo start`
   * Scan the QR code with **Expo Go**, or press `a`/`i`/`w` to open Android/iOS/web
   * Check the project's own README for any required `.env` variables

---

## 🎯 Purpose & Disclaimer

These projects are primarily **learning exercises**, not production applications.
Some closely follow official tutorials and codelabs (Google's Android Basics with Compose, JavaScript Mastery, etc.) and are meant for educational purposes only.

---

## 📚 Resources

* [https://developer.android.com](https://developer.android.com)
* Android Basics with Compose
* Official Android Codelabs
* [JavaScript Mastery](https://www.youtube.com/@javascriptmastery/videos)

---

## 🧗 Final Note

This repository reflects my step-by-step climb up the mobile development learning curve — one project at a time, across native and cross-platform stacks.

More projects and refinements may be added as the journey continues.