## StudentSaver

StudentSaver is a budgeting helper for students, focused on making it easier to track spending, save money, and stay on top of everyday expenses.

### Tech stack

- **Frontend**: [Next.js](https://nextjs.org/) (React) using [Bootstrap](https://getbootstrap.com/) for UI components and layout.
- **Backend**: Planned [Firebase](https://firebase.google.com/) (Authentication, Firestore/Realtime Database, Hosting, etc.) for backend services and data storage.

The app is intended to be hosted on Vercel. Next.js is a first‑class framework on Vercel and works well for both static content (like this landing page) and future dynamic features.

### Current status

- **Implemented**:
  - **Firebase Authentication** (email/password sign up, sign in, sign out)
  - **Grocery List Builder** — add/remove items, quantity selection, and optional search/autocomplete
  - **Firestore persistence** per signed-in user
- **Not implemented yet**:
  - Pricing engine (consumes the grocery list)
  - Production pricing data integration
  - Advanced budget analytics

### Local development

- **Install dependencies**:

  ```bash
  npm install
  ```

- **Run the dev server**:

  ```bash
  npm run dev
  ```

  Then open `http://localhost:3000` in your browser to use the Grocery List Builder.

### Deploying to Vercel

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. Create a project on Vercel and import the repo.
3. Vercel will auto-detect **Next.js** and use `npm run build` as the build command and `next start` as the default.
4. Configure Firebase Authentication + Firestore before first deployment.

### Grocery List Builder

- **Add** items by name with optional **search/autocomplete** (common groceries).
- **Quantity** selection (1–20) when adding and editable per row.
- **Remove** items from the list.
- **Output** is shown as `Item x1`, `Item x2`, etc., and is ready to be passed to a pricing engine.
- **Owner responsibility**: The page owns the list state (`list` / `setList`) and passes it to `GroceryListBuilder`; the same list can be passed to a future pricing engine component.

### Firebase persistence

The grocery list is saved to **Firestore** per signed-in user, so it survives refresh and is available across sessions.

1. **Firebase Console**: Create a Firestore database and enable **Email/Password** sign-in under Authentication → Sign-in method.
2. **Security rules**: Deploy `firestore.rules` so each user can read/write only their own `groceryLists/{userId}` document (e.g. `firebase deploy --only firestore:rules`).
3. If Anonymous auth was previously enabled, disable it unless you intentionally need guest sessions.
