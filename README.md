# 💰 Personal Finance Tracker API

Ứng dụng quản lý chi tiêu cá nhân - Built with **NestJS** + **PostgreSQL** + **TypeORM**

## Features

- 🔐 **Authentication** - JWT-based register/login
- 👤 **User Profile** - Manage profile & change password
- 📂 **Categories** - 12 default Vietnamese categories + custom ones
- 💸 **Transactions** - Full CRUD with filtering (type, category, date range) & pagination
- 🎯 **Budgets** - Set budget goals per category with status tracking
- 📊 **Analytics** - Income/expense summary, category breakdown, monthly trends
- 🔔 **Notifications** - Daily cron job alerts at 80% and 100% budget usage

## Quick Start

### Prerequisites
- Node.js ≥ 18
- PostgreSQL

### Setup
```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Create database
createdb personal_finance_tracker

# Start dev server
npm run start:dev
```

### Access
- **API Base URL:** `http://localhost:3000/api`
- **Swagger Docs:** `http://localhost:3000/api/docs`
- **Health Check:** `GET http://localhost:3000/api/health`

## API Endpoints

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Auth | POST | `/api/auth/register` | Register |
| Auth | POST | `/api/auth/login` | Login |
| Auth | GET | `/api/auth/profile` | Get profile |
| Users | GET | `/api/users/me` | Profile |
| Users | PATCH | `/api/users/me` | Update profile |
| Users | PATCH | `/api/users/me/password` | Change password |
| Categories | GET | `/api/categories` | List categories |
| Categories | POST | `/api/categories` | Create category |
| Categories | PATCH | `/api/categories/:id` | Update category |
| Categories | DELETE | `/api/categories/:id` | Delete category |
| Transactions | GET | `/api/transactions` | List with filters |
| Transactions | GET | `/api/transactions/:id` | Get one |
| Transactions | POST | `/api/transactions` | Create |
| Transactions | PATCH | `/api/transactions/:id` | Update |
| Transactions | DELETE | `/api/transactions/:id` | Delete |
| Budgets | GET | `/api/budgets` | List budgets |
| Budgets | GET | `/api/budgets/:id/status` | Budget status |
| Budgets | POST | `/api/budgets` | Create |
| Budgets | PATCH | `/api/budgets/:id` | Update |
| Budgets | DELETE | `/api/budgets/:id` | Delete |
| Analytics | GET | `/api/analytics/summary` | Summary |
| Analytics | GET | `/api/analytics/by-category` | Category breakdown |
| Analytics | GET | `/api/analytics/trend` | Monthly trend |
| Analytics | GET | `/api/analytics/budget-overview` | Budget overview |
| Notifications | GET | `/api/notifications` | List |
| Notifications | PATCH | `/api/notifications/:id/read` | Mark read |
| Notifications | PATCH | `/api/notifications/read-all` | Mark all read |
| Notifications | DELETE | `/api/notifications/:id` | Delete |

## Tech Stack
- **Runtime:** Node.js + Babel (JavaScript)
- **Framework:** NestJS 11
- **Database:** PostgreSQL + TypeORM
- **Auth:** Passport + JWT
- **Docs:** Swagger/OpenAPI
- **Scheduler:** @nestjs/schedule (Cron)
