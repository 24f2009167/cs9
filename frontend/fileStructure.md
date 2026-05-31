# Frontend File Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── jsconfig.json
├── context.md                          # Project context (single source of truth)
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── api/
│   │   └── index.js
│   │
│   ├── assets/
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── Button/
│   │   │   └── Button.tsx
│   │   ├── Modal/
│   │   │   └── Modal.tsx
│   │   └── NotificationModal/
│   │       ├── NotificationModal.tsx
│   │       └── README.md
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── RoleContext.jsx
│   │
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   └── UserLayout.jsx
│   │
│   ├── pages/
│   │   ├── user/
│   │   │   ├── layout.jsx
│   │   │   ├── service.js
│   │   │   ├── constants.js
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── Header/
│   │   │   │   │   └── DashboardHeader.jsx
│   │   │   │   ├── LeftPane/
│   │   │   │   │   └── LeftPane.jsx
│   │   │   │   └── QuestionCard/
│   │   │   │       ├── QuestionCard.tsx
│   │   │   │       └── index.js
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── Dashboard/
│   │   │       │   ├── index.jsx
│   │   │       │   └── README.md
│   │   │       ├── MyContributions/
│   │   │       │   ├── index.jsx
│   │   │       │   ├── service.js
│   │   │       │   └── README.md
│   │   │       └── ProfileSettings/
│   │   │           ├── index.jsx
│   │   │           └── README.md
│   │   │
│   │   ├── admin/
│   │   │   ├── index.jsx                   # AdminHome — shell with view routing
│   │   │   ├── README.md
│   │   │   ├── service.js
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── Header/
│   │   │   │   │   ├── AdminHeader.jsx
│   │   │   │   │   └── README.md
│   │   │   │   ├── LeftPane/
│   │   │   │   │   ├── AdminLeftPane.jsx
│   │   │   │   │   └── README.md
│   │   │   │   └── README.md
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── Dashboard/
│   │   │       │   ├── index.jsx
│   │   │       │   └── README.md
│   │   │       ├── FAQManagement/
│   │   │       │   ├── index.jsx
│   │   │       │   └── README.md
│   │   │       ├── QueriesManagement/
│   │   │       │   ├── index.jsx
│   │   │       │   └── README.md
│   │   │       ├── SparkLeaderboard/
│   │   │       │   ├── index.jsx
│   │   │       │   └── README.md
│   │   │       └── AdminProfile/
│   │   │           ├── index.jsx
│   │   │           └── README.md
│   │   │
│   │   └── shared/
│   │       └── components/
│   │           └── (future shared components)
│   │
│   ├── stores/
│   │   ├── authStore.js
│   │   └── themeStore.js
│   │
│   └── routes/
│       └── index.jsx
│
└── public/
    └── react.svg
```