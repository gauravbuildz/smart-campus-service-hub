<div align="center">

# 🎓 Smart Campus Service Hub

### *A Modern, Secure & Centralized Digital Campus Management Platform.*

[![Vercel Demo](https://img.shields.io/badge/Vercel-Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://smart-campus-management-4rg6.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gaurav-spnrec/smart-campus-management-1.git)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

[![GitHub stars](https://img.shields.io/github/stars/gaurav-spnrec/smart-campus-management-1?style=flat&color=yellow&logo=github)](https://github.com/gaurav-spnrec/smart-campus-management-1/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/gaurav-spnrec/smart-campus-management-1?style=flat&color=lightgrey&logo=github)](https://github.com/gaurav-spnrec/smart-campus-management-1/network/members)
[![GitHub last commit](https://img.shields.io/github/last-commit/gaurav-spnrec/smart-campus-management-1?style=flat&color=blue)](https://github.com/gaurav-spnrec/smart-campus-management-1/commits/main)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Prisma-5.18.0-2D3748?style=flat-square&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/NextAuth-4.24.14-009688?style=flat-square&logo=auth0" alt="NextAuth">
  <img src="https://img.shields.io/badge/SWR-2.4.2-3178C6?style=flat-square&logo=swr" alt="SWR">
  <img src="https://img.shields.io/badge/UploadThing-7.7.4-E25F5F?style=flat-square" alt="UploadThing">
</p>

</div>

---

## 📌 Table of Contents

- [🎥 Live Demo](#-live-demo)
- [📖 About Project](#-about-project)
- [🎯 Why Smart Campus Service Hub?](#-why-smart-campus-service-hub)
- [🚨 Problem Statement](#-problem-statement)
- [🚀 Proposed Solution](#-proposed-solution)
- [✨ Highlights](#-highlights)
- [🔑 Key Features](#-key-features)
- [📸 Screenshots](#-screenshots)
- [🛠️ Technology Stack](#-technology-stack)
- [🏗️ System Architecture](#-system-architecture)
- [🔒 Authentication Flow](#-authentication-flow)
- [🔄 Project Workflow](#-project-workflow)
- [📂 Folder Structure](#-folder-structure)
- [⚙️ Installation](#-installation)
- [📝 Environment Variables](#-environment-variables)
- [👤 Demo Credentials](#-demo-credentials)
- [🌐 Deployment](#-deployment)
- [📡 API Overview](#-api-overview)
- [🛡️ Security](#-security)
- [⚡ Performance](#-performance)
- [🔮 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🧔 Developer](#-developer)

---

## 🎥 Live Demo

<div align="center">
  <video src="assets/demo.mp4" width="90%" controls style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);"></video>
  <p><i>Complete application walkthrough</i></p>
</div>

---

## 📖 About Project

The **Smart Campus Service Hub** is a next-generation web application designed to digitize and centralize core campus student services. Traditional campuses are held back by fragmented communications, physical paperwork, and manual status auditing. This project provides a robust, role-based, real-time portal where students can submit service requests and complain about infrastructure failures, while administrators can track resolutions, broadcast unexpired notices, manage resources, and audit operational analytics under a unified, glassmorphic UI.

---

## 🎯 Why Smart Campus Service Hub?

Traditional campus administration relies on manual paperwork, physical notice boards, and scattered messaging channels. Smart Campus Service Hub modernizes these workflows, offering:

> [!TIP]
> **Frictionless Student Experience**: Students can request documents, log lost-and-found items, and track service requests in real-time without visiting office desks.

> [!IMPORTANT]
> **Operational Efficiency for Admins**: Centralized dashboards automate ticket routing, student records auditing, notice scheduling, and analytics tracking.

---

## 🚨 Problem Statement

| Traditional Campus | Smart Campus Service Hub |
| :--- | :--- |
| ❌ Scattered notices on physical corkboards or chat groups | 📢 Centralized announcement feed with priorities and expiry dates |
| ❌ Paper-heavy certificate and ID card request forms | ⚡ Digitized, role-protected online request workflows |
| ❌ Infrastructure tickets verbalized or forgotten | 🔒 Interactive issue logs with real-time status timelines |
| ❌ Lost belongings tracked on paper logs | 🎒 Verifiable digital claims dashboard with image proofs |

---

## 🚀 Proposed Solution

The platform automates the student-to-admin lifecycle through a highly coordinated system architecture:

```mermaid
graph LR
    Student[🧑‍🎓 Student] -->|Submit Request / Issue| DB[⚡ Live Dashboard]
    DB -->|Store Ticket| API[📡 Serverless Route]
    API -->|Process & Log| Admin[👩‍💼 Admin Panel]
    Admin -->|Review & Action| Update[🔔 Notification Inbox]
    Update -->|Track Resolution| Completed[✅ Completed / Resolved]
```

---

## ✨ Highlights

| ⚡ Lightning Fast | 🔒 Built Secure | 📱 Fully Responsive |
| :--- | :--- | :--- |
| Client-side queries leverage `SWR` caching for real-time responsiveness. | Password hashing with `bcryptjs` and path guards via NextAuth. | Native support for desktop sidebars and mobile drawer lists. |

| 🎯 Role-Based (RBAC) | 📊 Live Analytics | ☁️ Cloud Ready |
| :--- | :--- | :--- |
| Dynamic route rewrites for students and administrators. | Admin dashboard displaying issue distributions and statistics. | Engineered for Vercel Serverless and PostgreSQL cloud pools. |

---

## 🔑 Key Features

- **🔐 NextAuth Protection**: Dynamic dashboard interfaces served according to student/admin JWT permissions.
- **🛠️ Automated Ticketing**: Key-word matching auto-calculates severity level (`HIGH` or `LOW`) for faster triage.
- **📢 Notice Board**: Broadcast events, exam schedules, and circulars with attachment options.
- **🎒 Claims Engine**: Submit image claims on found items. Admin approvals auto-reject duplicate claims.
- **📄 Forms Directory**: Downloadable course guidelines, timetables, and documents in one shared hub.
- **📡 Serverless APIs**: Fully audited CRUD endpoints validating access scopes.

---

## 📸 Screenshots

| <a href="screenshots/01-landing-page.png"><img src="screenshots/01-landing-page.png" alt="Landing Page" style="border-radius: 8px;" /></a> | <a href="screenshots/04-student-dashboard.png"><img src="screenshots/04-student-dashboard.png" alt="Student Dashboard" style="border-radius: 8px;" /></a> | <a href="screenshots/05-notices-event.png"><img src="screenshots/05-notices-event.png" alt="Notices & Events" style="border-radius: 8px;" /></a> |
|:---:|:---:|:---:|
| **Landing Page** | **Student Dashboard** | **Notices & Events** |
| <a href="screenshots/06-lost-found.png"><img src="screenshots/06-lost-found.png" alt="Lost & Found" style="border-radius: 8px;" /></a> | <a href="screenshots/07-resource-hub.png"><img src="screenshots/07-resource-hub.png" alt="Resource Hub" style="border-radius: 8px;" /></a> | <a href="screenshots/08-service-request.png"><img src="screenshots/08-service-request.png" alt="Service Requests" style="border-radius: 8px;" /></a> |
| **Lost & Found** | **Resource Hub** | **Service Requests** |
| <a href="screenshots/10-admin-dashboard.png"><img src="screenshots/10-admin-dashboard.png" alt="Admin Dashboard" style="border-radius: 8px;" /></a> | <a href="screenshots/11-student-management.png"><img src="screenshots/11-student-management.png" alt="Student Management" style="border-radius: 8px;" /></a> | <a href="screenshots/12-analytics-hub.png"><img src="screenshots/12-analytics-hub.png" alt="Analytics Hub" style="border-radius: 8px;" /></a> |
| **Admin Dashboard** | **Student Management** | **Analytics Hub** |

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose | Version |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | Client/Server Rendering & Router Configs | `16.2.6` |
| **UI Library** | React | Component state life cycles and view logic | `19.2.4` |
| **Styling** | Tailwind CSS | Responsive glassmorphic layout styling | `v4.0` |
| **ORM** | Prisma | Type-safe database query generation | `5.18.0` |
| **Database** | PostgreSQL | Cloud-based relational database layer | - |
| **Authentication** | NextAuth | CredentialsProvider session JWT tracking | `4.24.14` |
| **Data Fetching** | SWR | High-speed cache syncing and polling | `2.4.2` |
| **File Handling** | UploadThing | Image upload hosting with local mock preview | `7.7.4` |

---

## 🏗️ System Architecture

The application decouples client views and server operations, utilizing Next.js middleware routing to dynamically guide users.

```mermaid
graph TD
    Browser([🌐 Browser]) -->|HTTPS Request| NextJS[⚡ Next.js App Router]
    NextJS -->|Protected via Middleware| AuthGuard{🔒 NextAuth Middleware}
    AuthGuard -->|Dynamic Rewrite| AuthRoutes[📂 /dashboard]
    AuthRoutes -->|API Request| APILayer[📡 Serverless API Routes]
    APILayer -->|Queries / Mutations| Prisma[⬢ Prisma ORM]
    Prisma -->|Read / Write| PG[(🐘 PostgreSQL Database)]
```

---

## 🔒 Authentication Flow

Detailed flow showing login validation, token issuance, and protected route authorization:

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Admin
    participant Client as Next.js Client
    participant MW as Middleware Guard
    participant Auth as NextAuth (bcryptjs)
    participant DB as PostgreSQL Database

    User->>Client: Enter Email & Password
    Client->>Auth: POST /api/auth/callback/credentials
    Auth->>DB: Query user by email
    DB-->>Auth: Return user record (hashed password)
    Auth->>Auth: Compare passwords using bcryptjs
    alt Credentials Invalid
        Auth-->>Client: Return Login Error
        Client-->>User: Display Toast Error
    else Credentials Valid
        Auth-->>Client: Generate JWT Token & Session Cookie
    end
    Client->>MW: Request protected page (/dashboard/*)
    alt No Active Session
        MW-->>Client: Redirect to Home Page (/?login=true)
    else Session Valid & Role Authorized
        MW-->>Client: Allow request and render role-based view
        Client-->>User: Render Dashboard
    end
```

---

## 🔄 Project Workflow

```mermaid
graph LR
    User[🧑‍💻 User] --> Auth{🔒 Authentication}
    Auth -->|Valid Session| Dash[⚡ Dashboard]
    Dash -->|Perform Action| API[📡 Serverless API]
    API -->|Read/Write| DB[(🐘 Database)]
    DB -->|Dispatch Logs| Notif[🔔 Notifications Inbox]
    Notif --> Success([✅ Success Status])
```

---

## 📂 Folder Structure

```text
smart-campus-management/
├── prisma/                 # Database schema models & seed scripts
├── public/                 # Static assets & public resources
├── screenshots/            # UI screenshot gallery
└── src/
    ├── app/                # App Router files & Serverless API layers
    │   ├── api/            # Role-protected API route endpoints
    │   └── dashboard/      # Unified dynamic dashboard layouts
    ├── components/         # Reusable core client components
    ├── lib/                # Database config & NextAuth callbacks
    └── middleware.ts       # Route guard middleware
```

---

## ⚙️ Installation

### 1. Clone the Project
```bash
git clone https://github.com/gaurav-spnrec/smart-campus-management-1.git
cd smart-campus-management-1
```

### 2. Configure Environment
Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables)).

### 3. Install Dependencies
```bash
npm install
```

### 4. Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 5. Seed Initial Data
```bash
npx prisma db seed
```

### 6. Launch Local Server
```bash
npm run dev
```
Open [](http://localhost:3000) to view the application.

---

## 📝 Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string with pooling properties |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection string without poolers |
| `NEXTAUTH_SECRET` | Yes | Custom secret key for JWT hashes encryption |
| `NEXTAUTH_URL` | Yes | Base canonical URL of the application site |
| `UPLOADTHING_TOKEN`| No | Token for asset cloud upload (defaults to simulated mock) |

---

## 👤 Demo Credentials

For testing the application locally or checking deployment, use the following accounts:

- **Administrator Portal**
  - **Email**: `admin@campus.edu`
  - **Password**: `admin123`
- **Student Portal**
  - **Email**: `student@campus.edu`
  - **Password**: `student123`

---

## 🌐 Deployment

The platform is designed to be fully serverless-ready and can be deployed in minutes on Vercel:

1. **Push your code** to a GitHub repository.
2. **Import the repository** into Vercel.
3. **Configure Environment Variables** in Vercel to match your `.env` values.
4. **Deploy!** Vercel will automatically build and run migrations during the build phase via `npm run build`.

---

## 📡 API Overview

All routes except authentication callback require valid NextAuth cookies.

| Endpoint | Method | Role | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Student signup callback |
| `/api/students` | `GET`/`PUT`/`DELETE` | Admin | Student user database operations |
| `/api/notices` | `GET`/`POST`/`DELETE` | User/Admin | Notice board events creation & listings |
| `/api/issues` | `GET`/`POST`/`PATCH` | Student/Admin | Raise complaints and log workflow audits |
| `/api/lost-found` | `GET`/`POST`/`DELETE` | User/Admin | List, report, and delete lost/found items |
| `/api/lost-found/claim`| `GET`/`POST`/`PATCH` | Student/Admin | Manage item claims ownership workflows |
| `/api/notifications` | `GET`/`PATCH` | Authorized | Read status drawer notifications in inbox |

---

## 🛡️ Security

- **Session Security**: Stateless JSON Web Tokens (JWT) mapped securely via NextAuth.
- **Path Guarding**: Server-side middleware checks route structures to block unauthorized page requests.
- **Credential Storage**: Cryptographically hashes account passwords using strong multi-round `bcryptjs`.
- **RBAC API Enforcement**: Dynamic server-side checks reject student requests targeting `/api/students` or status mutations.

---

## ⚡ Performance

- **Optimized Caching**: Leverages `SWR` query caches to update lists in real-time, avoiding full page refreshes.
- **Server Components**: Leverages React Server Components (RSC) to reduce client-side bundle size.
- **Connection Reusability**: Prevents connection pool starvation by caching the PrismaClient instance globally.
- **Dynamic Asset Loader**: Image elements dynamically fall back to simulated previews when credentials are missing.

---

## 🔮 Roadmap

- **🤖 AI Assistant**: Large-Language Model assistant to resolve student FAQs and direct inquiries.
- **🔔 Push Notifications**: Web-push protocols to alert users about exam timetables and alerts.
- **📱 QR Attendance**: Secure QR check-ins for events, lectures, and resource claims.
- **📅 Calendar Integration**: Dynamic dashboard widgets syncing events to Outlook & Google Calendar.
- **✉️ Mobile App**: Wrap web app into a mobile interface for native iOS and Android push integration.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps to contribute:
1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

## 🧔 Developer

<div align="center">

Designed and developed with ❤️ by **Gaurav Kumar**.

<p align="center">
  <a href="https://github.com/gaurav-spnrec"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://www.linkedin.com/in/gauravbuildz/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
</p>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Built with ❤️ using Next.js + React + Prisma

⭐ If you found this project useful, please give it a Star.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

</div>
