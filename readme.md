# 🏆 FKS Carrom Open 2027 — Production Package

Official web repository and backend API architecture for the **FKS Carrom Open 2027** intraschool tournament held at **The Future Kid's School, Hyderabad** (January 6th & 7th, 2027).

---

## 📁 Repository Structure

```text
├── schema.sql              # Supabase PostgreSQL database tables, indexes & RLS policies
├── package.json            # Node.js dependencies (@supabase/supabase-js, express, cors)
├── .env.example            # Environment variables template
├── lib/
│   └── supabaseClient.js   # Reusable Supabase client initialization
├── api/
│   ├── registrations.js    # Registration submissions & Cash payment verification
│   ├── results.js          # Knockout match scores & standings API
│   ├── volunteers.js       # Volunteer registration & news noticeboard API
│   └── auth.js             # Official Coordinator PIN authentication
│
├── Public Pages (Desktop View, Grandmaster Court Theme):
│   ├── index.html          # Home — Event cards, Precisa boards, Knockout ladder
│   ├── schedule.html       # Tournament timetable (Jan 6 & 7), 09:00 AM roll call
│   ├── overview.html       # Precisa Elegant specs, 4 carrom rules, helpdesk
│   ├── results.html        # Live Championship Arena, podium, verified match sheets
│   ├── registration.html   # Player registration (Solos ₹200, Doubles ₹200, Open ₹150)
│   ├── volunteer.html      # Volunteer / Referee registration form
│   ├── volunteer_news.html # Live volunteer announcements & dispatch noticeboard
│   └── login.html          # Coordinator sign-in with 6-digit PIN authentication
│
└── Admin Consoles (Desktop View):
    ├── admin_payments.html  # Cash verification (Chandan / Navaneet)
    ├── admin_results.html   # Match score entry, station allocation & round scoring
    ├── admin_volunteers.html# Referee assignment & roster management
    └── admin_news.html      # Broadcast announcement editor & push console
```

---

## 🚀 Quick Setup & Deployment

### 1. Database Setup (Supabase)
1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Paste the contents of `schema.sql` and click **Run**.
4. Copy your `Project URL` and `service_role` / `anon` keys from **Project Settings > API**.

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Serverless Deployment
- **Vercel**: Deploy directly. The `/api` directory will automatically become Vercel Serverless Functions.
- **Netlify**: Functions in `/api` will be detected and deployed under `/.netlify/functions/`.

---

## 🔐 Coordinator Access Credentials

| Official Name | 6-Digit PIN | Role |
| :--- | :--- | :--- |
| **Satwik** | `201313` | Coordinator / Admin |
| **Sravan** | `201317` | Coordinator / Admin |
| **Ramcharan** | `201328` | Coordinator / Admin |
| **Navaneet** | `201331` | Cash Payment Desk & Coordinator |
| **Chandan** | `201303` | Cash Payment Desk & Coordinator |
| **Abhinav** | `201304` | Coordinator / Admin |
