# Frontend File Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── jsconfig.json
├── DESIGN.md                   # Color tokens, typography, shared components
│
└── src/
    ├── App.jsx
    ├── main.jsx
    │
    ├── api/
    │   └── index.js            ← axiosPublic(), axisPrivate() helpers
    │
    ├── assets/
    │   └── react.svg
    │
    ├── components/             ← Shared UI (direct imports, no barrel files)
    │   ├── Button/
    │   │   └── Button.tsx
    │   ├── Footer/
    │   │   ├── Footer.tsx
    │   │   └── README.md
    │   ├── Input/
    │   │   └── Input.tsx
    │   ├── Modal/
    │   │   └── Modal.tsx
    │   ├── NotificationModal/
    │   │   └── NotificationModal.tsx
    │   └── Select/
    │       └── Select.tsx      ← TypeScript; scrollable dropdown (max-h-60)
    │
    ├── contexts/
    │   ├── AuthContext.jsx
    │   └── RoleContext.jsx
    │
    ├── layouts/
    │   ├── AdminLayout.jsx
    │   └── UserLayout.jsx
    │
    ├── lib/
    │   └── notify.js           ← notifyError() / notifySuccess() toasts
    │
    ├── pages/
    │   ├── landing/            ← Public home page (/)
    │   │   ├── index.jsx
    │   │   ├── service.jsx
    │   │   ├── LoginModal/
    │   │   └── README.md
    │   │
    │   ├── user/               ← Authenticated student section (SPA, no URL change)
    │   │   ├── layout.jsx      ← Header + LeftPane shell; outlet for pages
    │   │   ├── service.js      ← fetchQuestions, voteQuestion, fetchNotifications, etc.
    │   │   ├── constants.js    ← STATUS_CONFIG, STATUS_LABEL, role constants
    │   │   │
    │   │   ├── components/
    │   │   │   ├── AnswerComments/
    │   │   │   │   └── AnswerComments.jsx
    │   │   │   ├── FAQCategories/
    │   │   │   │   └── FAQCategories.jsx
    │   │   │   ├── Header/
    │   │   │   │   ├── DashboardHeader.jsx   ← User avatar, notifs, dark mode
    │   │   │   │   └── DashboardHeader.module.css
    │   │   │   ├── LeftPane/
    │   │   │   │   └── LeftPane.jsx          ← Collapsible nav
    │   │   │   ├── NotifSidebar/
    │   │   │   │   └── NotifSidebar.jsx
    │   │   │   ├── QuestionCard/
    │   │   │   │   └── QuestionCard.tsx
    │   │   │   ├── ReportModal/
    │   │   │   │   └── ReportModal.tsx       ← Report answer / comment
    │   │   │   └── SearchModal/
    │   │   │       └── SearchModal.jsx
    │   │   │
    │   │   └── pages/
    │   │       ├── Dashboard/
    │   │       │   └── index.jsx             ← Q&A feed + search
    │   │       ├── Leaderboard/
    │   │       │   └── index.jsx             ← Spark / reputation / acceptedAnswers
    │   │       ├── MyContributions/
    │   │       │   ├── index.jsx
    │   │       │   ├── service.js
    │   │       │   └── PLAN.md
    │   │       ├── ProfileSettings/
    │   │       │   └── index.jsx             ← Edit profile, credentials, tags
    │   │       ├── QueryDetail/
    │   │       │   ├── index.jsx             ← Question + answers + comments
    │   │       │   └── README.md
    │   │       └── RaiseQuery/
    │   │           └── index.jsx             ← Ask a new question form
    │   │
    │   └── admin/              ← Admin panel (separate layout, separate routes)
    │       ├── index.jsx       ← Shell with view routing by ?view= query param
    │       ├── service.js
    │       ├── components/
    │       │   ├── Header/
    │       │   │   ├── AdminHeader.jsx
    │       │   │   └── README.md
    │       │   ├── LeftPane/
    │       │   │   ├── AdminLeftPane.jsx
    │       │   │   └── README.md
    │       │   └── README.md
    │       └── pages/
    │           ├── Dashboard/
    │           │   └── index.jsx             ← Stats overview
    │           ├── FAQManagement/
    │           │   ├── index.jsx             ← CRUD for FAQ entries
    │           │   └── README.md
    │           ├── QueriesManagement/
    │           │   └── index.jsx             ← All community questions, moderation
    │           ├── SparkLeaderboard/
    │           │   └── index.jsx             ← Leaderboard with controls
    │           └── AdminProfile/
    │               └── index.jsx
    │
    ├── stores/
    │   ├── authStore.js        ← user, token, login/logout (Zustand, persisted)
    │   └── themeStore.js       ← dark mode toggle (Zustand, persisted)
    │
    └── routes/
        └── index.jsx           ← Route definitions + ProtectedRoute wrappers
```

## Notes

- Files in `pages/user/pages/<PageName>/` need **4 levels up** to reach `src/` (`../../../../`)
- Files in `pages/user/components/<ComponentName>/` also need **4 levels up**
- Files in `pages/user/layout.jsx` need **3 levels up** (`../../../`)
- SPA navigation within the user section — **no URL changes** when switching views
- Use `useOutletContext` for layout → page communication