<div align="center">

<!-- 🚨 HACKATHON TIP: Replace this placeholder with a beautiful Canva banner (1200x400px) -->
<img src="https://via.placeholder.com/1200x400/0f172a/38bdf8?text=Smart+Campus+Service+Hub+Banner" alt="Smart Campus Hub Banner" width="100%" />

# 🎓 Smart Campus Service Hub

### *Modernizing student services, resolving infrastructure issues, and centralizing campus operations.*

<p align="center">
  <a href="[YOUR_LIVE_DEMO_LINK]"><strong>🌐 Experience Live Demo</strong></a> · 
  <a href="[YOUR_PITCH_VIDEO_LINK]"><strong>🎥 Watch 2-Min Pitch</strong></a> · 
  <a href="#-getting-started"><strong>💻 Installation</strong></a>
</p>

[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.2.4-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.18.0-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24.14-cyan?style=for-the-badge&logo=nextauth)](https://next-auth.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🚀 2-Minute Elevator Pitch
In traditional institutions, campus operations are plagued by fragmented WhatsApp groups, offline paper forms, and untracked complaints. **Smart Campus Service Hub** is a unified, real-time platform that brings infrastructure complaints, lost & found requests, and official document applications into one beautifully designed, role-based dashboard. 

---

## 💥 The Problem vs. The Solution

| ❌ The Old Way (Problem) | ✅ The Smart Campus Way (Solution) |
| :--- | :--- |
| **Fragmented Comm:** Notices lost in endless WhatsApp chats. | **Centralized Hub:** Categorized, pin-able digital notice board. |
| **Untracked Issues:** Verbal complaints to wardens get ignored. | **Transparent Tracking:** Real-time ticket timelines & status logs. |
| **Paper Forms:** Standing in line for ID cards or Bonafide certs. | **Digital Desk:** 1-click applications with digital attachments. |
| **Manual Triage:** Admins overwhelmed figuring out what's urgent. | **Auto-Severity NLP:** Smart keywords flag dangerous issues instantly. |

---

## ✨ The "X-Factor" (Core Innovation)

### 🧠 Auto-Severity Issue Detector
We didn't just build a form; we built a smart triage system. When a student reports an issue, our custom keyword-matching algorithm scans the description. 
* Mention *"spark"*, *"fire"*, or *"live wire"*? ➡️ Instantly flagged as **HIGH** severity. 
* Mention *"dusty"* or *"slow wifi"*? ➡️ Flagged as **LOW** severity.
This helps campus admins prioritize critical infrastructure threats instantly without manual sorting.

> **Visualizing the Magic:** 
> *(Hackathon Tip: Add a 3-second GIF here showing a student typing a complaint about a "live wire" and the system automatically tagging it as HIGH priority)*
> <!-- <img src="[LINK_TO_YOUR_GIF]" width="600" /> -->

---

## 📸 Platform Previews
*(Judges love visuals! Add 3-4 high-quality screenshots or GIFs of your best UI here)*

<div align="center">
  <img src="[LINK_TO_DASHBOARD_SCREENSHOT]" alt="Admin Dashboard" width="48%" />
  <img src="[LINK_TO_LOST_AND_FOUND_SCREENSHOT]" alt="Lost and Found" width="48%" />
</div>

---

## 🛠 Core Features

* **🛡️ Secure Role-Based Access (RBAC):** Dynamic dashboards using NextAuth middleware. `STUDENT` and `ADMIN` roles see completely different, tailored UIs.
* **🎒 Lost & Found Ecosystem:** Secure reporter tracking with image proofs. Students log items and submit verified ownership claims, all resolved by admins.
* **📄 Resource & Service Desk:** 1-click applications for Bonafide certificates, ID card requests, and direct downloads for academic guidelines.
* **📊 Analytics Engine:** Real-time distribution charts showing open issue stats, notification logs, and user activity metrics.
* **🔔 Real-Time Notification Matrix:** A centralized push-system alerting students of claim approvals, notice broadcasts, and ticket resolutions in a clean inbox drawer.

---

## 🏗️ System Architecture

Our decoupled App Router structure leverages Next.js route rewrites for dynamic client pathways, ensuring seamless authorization.

```mermaid
graph TD
    User([User Browser]) -->|Request URL| MW[src/middleware.ts]
    MW -->|Guest / Not Auth| RedirectHome[Redirect to /?login=true]
    MW -->|Auth Session Check| RW{next.config.ts Rewrites}
    
    RW -->|/admin/dashboard| RouteDashboard[/dashboard]
    RW -->|/student/dashboard| RouteDashboard
    
    RouteDashboard --> Layout[Dashboard Layout]
    Layout --> PageRenderer[Role-Based Rendering]
    
    PageRenderer -->|Role: STUDENT| StudentView[Student Widgets]
    PageRenderer -->|Role: ADMIN| AdminView[Admin Widgets]
    
    StudentView & AdminView -->|API Fetch / Poll| SWR[SWR Hooks]
    SWR -->|Requests| APILayer[Next.js Serverless APIs]
    APILayer -->|Queries| Prisma[Prisma ORM]
    Prisma -->|Read/Write| DB[(Neon PostgreSQL)]
```

---

## 🧗 Challenges We Ran Into (And Solved!)
* **NextAuth Middleware Loops:** Implementing role-based path protection initially caused infinite redirect loops. We solved this by creating strict dynamic path mapping in `middleware.ts` to separate `/admin` and `/student` routes securely.
* **Database Connection Leaks:** Hot-reloading in Next.js development kept exhausting our Neon Serverless PostgreSQL connection pool. We implemented a global cached PrismaClient initializer (`src/lib/db.ts`) to preserve instances across reloads.
* **Real-time UX vs Server Load:** We wanted real-time updates without WebSockets (to keep the architecture completely serverless). We optimized `SWR` caching with dynamic background polling (every 5 seconds) to simulate real-time feels without crashing our API limits.

---

## 💻 Getting Started (Local Setup)

Want to run this locally? It takes less than 3 minutes.

**1. Clone the Repository & Install Dependencies**
```bash
git clone [https://github.com/gaurav-spnrec/smart-campus-management-1.git](https://github.com/gaurav-spnrec/smart-campus-management-1.git)
cd smart-campus-management-1
npm install
```

**2. Environment Variables Configuration**
Create a `.env` file in the root directory:
```properties
# Prisma Database Connections (Neon Serverless)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/neondb?sslmode=require"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]/neondb?sslmode=require"

# NextAuth Configurations
NEXTAUTH_SECRET="super-secret-campus-key-12345"
NEXTAUTH_URL="http://localhost:3000"

# Optional: UploadThing (Mock upload is active if missing)
# UPLOADTHING_TOKEN="YOUR_UPLOADTHING_API_TOKEN"
```

**3. Database Setup & Run**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed # Seeds mock admin & student accounts
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

**Local Testing Credentials:**
* **Administrator:** `admin@campus.edu` / `admin123`
* **Student:** `student@campus.edu` / `student123`

---

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  Built with ☕ and Next.js for the <b>[Insert Hackathon Name]</b> Hackathon. <br/>
  Distributed under the MIT License.
</div>
