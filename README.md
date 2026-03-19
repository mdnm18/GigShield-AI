# GigShield-AI

GigShield-AI is a comprehensive Next.js based **Policy and Claims Management System** tailored for the gig economy. It allows workers to securely purchase insurance policies, make payments, and submit claims, while providing a powerful admin dashboard to review claims, assess fraud risk, and govern the system.

## 🚀 Key Features

- **Worker Portal**: Specific interfaces allowing workers to subscribe to policies, submit claims (with GPS location tracking for verification), fulfill premium payments, and receive status notifications.
- **Admin Dashboard**: Empowers administrators to review incoming claims, inspect automatically generated fraud scores, handle user networks, and manually approve or reject claims.
- **Secure Authentication**: Workers use a seamless OTP-based login system for easy access, while admins utilize a dedicated secure authentication flow.
- **Real-time Notifications**: Automated, real-time alerts update workers precisely when their claims are processed or actions are needed.

## 🛠️ Tech Stack

- **Frontend & Backend**: [Next.js (App Router)](https://nextjs.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database Engine**: [PostgreSQL](https://www.postgresql.org/)
- **Styling**: Tailwind CSS & Lucide React Icons

---

## 🏗️ Architecture & System Design

Below is a visual diagram of the architectural logic governing the GigShield-AI ecosystem and the general workflows of the application.

![System Design Diagram](./public/devtrails_system_design.jpeg)

*The system design illustrating the request flow between the Frontend Dashboards, Next.js Backend APIs, and the core PostgreSQL Database layer.*

---

## 🗄️ Database Models

The structural backbone of the application involves distinct, highly integrated relational models governing Users, Policies, Claims, Payments, and Notifications.

![Database Model Diagram](./public/model_devtraails.jpeg)

*Entity-Relationship visualization of the underlying database architecture implemented through Prisma.*

---

## 💻 Getting Started

### Prerequisites
Make sure you have Node.js and a running PostgreSQL instance accessible locally or on the cloud.

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mdnm18/GigShield-AI.git
   cd GigShield-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file at the root of the project and add your database connection string and any necessary secrets:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/gigshield?schema=public"
   ```

4. **Initialize the Database:**
   Generate the Prisma TypeScript client and push the schema directly to your configured PostgreSQL database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   
Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform.
