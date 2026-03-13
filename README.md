## StudentSaver

StudentSaver is a budgeting helper for students, focused on making it easier to track spending, save money, and stay on top of everyday expenses.

### Tech stack

- **Frontend**: [Next.js](https://nextjs.org/) (React) using [Bootstrap](https://getbootstrap.com/) for UI components and layout.
- **Backend**: Planned [Firebase](https://firebase.google.com/) (Authentication, Firestore/Realtime Database, Hosting, etc.) for backend services and data storage.

The app is intended to be hosted on Vercel. Next.js is a first‑class framework on Vercel and works well for both static content (like this landing page) and future dynamic features.

### Current status

- **Implemented**: A static marketing/landing page built with Next.js and Bootstrap.
- **Not implemented yet**:
  - User authentication
  - Budget tracking features
  - Data storage and sync with Firebase
  - Any dynamic functionality beyond the landing page

Right now this project is only a marketing/landing page for StudentSaver. All future application features (sign up, sign in, budgets, spending insights, etc.) will be built on top of this foundation, with Firebase providing backend capabilities.

### Local development

- **Install dependencies**:

  ```bash
  npm install
  ```

- **Run the dev server**:

  ```bash
  npm run dev
  ```

  Then open `http://localhost:3000` in your browser to view the landing page.

### Deploying to Vercel

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. Create a project on Vercel and import the repo.
3. Vercel will auto-detect **Next.js** and use `npm run build` as the build command and `next start` as the default.
4. Since the current app is just a landing page, no environment variables or Firebase configuration are required yet.

