<div align="center">
  <h1>🎓 Smart Campus Service Hub</h1>
  <h3><i>A centralized digital platform modernizing college campus communication, notice dissemination, and issue tracking.</i></h3>

  <h2><b><a href="https://smart-campus-management-4rg6.vercel.app/">🚀 CLICK HERE FOR LIVE DEMO</a></b></h2>
  
  <br />

  <!-- TECH STACK BADGES -->
  ![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![React](https://img.shields.io/badge/React-19.2.4-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-5.18.0-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

# 💡 The Problem
In most colleges, students and administrators struggle with fragmented communication and operations:
* **📱 Notice Clutter:** Important notices and events get lost in cluttered messaging apps or physical notice boards.
* **📝 Manual Complaints:** Reporting issues (broken classroom projectors, hostel Wi-Fi, etc.) involves slow, manual paperwork.
* **🔍 Lost & Found:** Finding lost belongings relies on group chats and luck.

---

# 🚀 Our Solution
**Smart Campus Service Hub** digitizes daily campus operations in a single dashboard:
* **📌 Centralized Notice Board:** Categorized events and announcements posted by administrators.
* **🛠️ Digital Issue Tracker:** Students submit complaints and track resolution status in real time.
* **🎒 Lost & Found Hub:** A dedicated space to report lost belongings or log found items.

---

# 💻 Tech Stack
* **Framework:** Next.js 16 (Turbopack) & React 19
* **Styling:** Tailwind CSS v4
* **Database:** PostgreSQL (Neon Serverless)
* **ORM:** Prisma ORM
* **Authentication:** NextAuth.js
* **Deployment:** Vercel

---

# 🛠️ Next.js 16 Compatibility Updates
To comply with Next.js 16 standards and ensure seamless Vercel deployments, the following improvements have been made:
1. **Isolated Auth Configuration**: Moved `authOptions` out of the API route into `src/lib/auth.ts` to prevent invalid Route export field errors.
2. **Next.js 16 Proxy Convention**: Moved the auth middleware to `src/proxy.ts` (satisfying the deprecation of `src/middleware.ts` in Next.js 16).
3. **Database URL Optimization**: Cleaned up the Neon connection URLs to support connection pooling without `channel_binding` limits.

---

# 🚀 Running Locally 

### **1. Clone the repository**
```bash
git clone https://github.com/gaurav-spnrec/smart-campus-management-1.git
cd smart-campus-management
```

### **2. Setup Environment Variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<host>.<region>.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### **3. Install Dependencies & Run**
```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
