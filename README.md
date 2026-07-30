<div align="center">

# Circl — ROSCA System

### Secure Full-Stack Digital Rotating Savings and Credit Association Platform

A modern full-stack web application that digitizes traditional Rotating Savings and Credit Association (ROSCA) groups through secure authentication, real-time auction bidding, wallet management, recovery handling, dynamic trust scoring, and transparent dividend distributions.

![Java](https://img.shields.io/badge/Java-17%2B-red)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-success)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8)
![Maven](https://img.shields.io/badge/Maven-Build-red)

</div>

---

# Overview

A **Rotating Savings and Credit Association (ROSCA)** is a community-driven financial model where members contribute a fixed amount of money at regular intervals. During each cycle, one member receives the pooled payout until every participant has received it once.

Traditional ROSCA systems rely heavily on manual bookkeeping and trust between members, which often leads to payment defaults, lack of transparency, delayed settlements, and calculation errors.

**Circl** digitizes this entire process by providing a secure Spring Boot 3 backend and a modern React frontend that automates group management, competitive auctions, financial settlements, wallet transactions, recovery handling, and member trust evaluation through REST APIs.

---

# Key Features

### Authentication & Security

- JWT-based stateless authentication
- BCrypt password hashing
- Secure role-based authorization

### User Management

- Account registration & login
- User profile & wallet balance tracking
- Dynamic trust scoring

### Group Management

- Create ROSCA groups with customizable pool amounts and frequencies
- Peer-to-peer circle administration with zero middleman fees
- Active member tracking and circle progress indicators

### Interactive Roadmap & Education

- Modern 5-stage visual roadmap detailing the savings lifecycle
- Transparent dividend policy (*any indivisible dividend remainder is credited directly to the group creator*)

### Competitive Auction System

- Real-time scheduled bidding cycles
- Dynamic discount calculations
- Automatic winner selection upon cycle completion

### Wallet & Settlement System

- Automated contribution collection
- Instant winner payout allocation
- Equal dividend distribution with creator remainder bonus
- Transaction audit ledger

### Recovery & Penalty Engine

- Automatic default detection for missed contributions
- 5% late penalty fee redirected back into the pool winner's payout
- Automatic recovery processing upon wallet top-up

### Dynamic Trust Engine

Trust score evaluation based on:
- On-time contribution records
- Default history
- Recovery completion

---

# Technology Stack

| Category | Technology |
|---|---|
| **Backend Framework** | Spring Boot 3.x |
| **Language** | Java 17+ / TypeScript |
| **Frontend Framework** | React 19 (Vite + TanStack Router) |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Security** | Spring Security + JWT |
| **ORM / Database** | Spring Data JPA / Hibernate + PostgreSQL |
| **State & Query** | TanStack Query (React Query) |
| **Build Tools** | Maven + Vite |

---

# High-Level Architecture

```text
                  Browser Client (React 19 / Vite)
                                │
                                ▼
                      Spring Boot REST API (Port 8081)
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
 Authentication            Business Logic           Scheduler
     (JWT)                   Services            Background Jobs
                                │
                         Spring Data JPA
                                │
                           PostgreSQL
```

---

# Core Modules

| Module | Description |
|---|---|
| **Authentication** | User registration, login, JWT generation & validation |
| **User** | User profile & wallet balance management |
| **Group** | ROSCA group creation and circle configuration |
| **Membership** | User-group relationship and status tracking |
| **Auction** | Real-time auction creation, bidding, and winner selection |
| **Wallet** | Financial transactions, debits, credits, and balance tracking |
| **Settlement** | Automated financial settlement and dividend allocation |
| **Recovery** | Recovery processing and 5% penalty handling |
| **Trust Engine** | Dynamic member trust score updates |
| **Transactions** | Complete financial audit ledger |
| **Reports** | Consolidated member financial performance analytics |

---

# Settlement Engine & Dividend Policy

The Settlement Engine automates financial distributions when an auction closes:

1. **Contributions Collected**: Debits monthly deposit amounts from member wallets.
2. **Default Handling**: Missed contributions trigger a recovery record and a 5% penalty fee flowing to the cycle winner.
3. **Winner Payout**: Payout pool credited directly to the winning bidder.
4. **Dividend Distribution**: Total discount pool divided evenly among members in integer cents.
5. **Indivisible Remainder Policy**: Any remaining fractional cents after equal integer division are credited as a bonus to the **Group Creator**.

```text
Auction Ends
      │
      ▼
Collect Contributions
      │
      ├──────────────┐
      │              │
Successful      Contribution Failed
      │              │
      ▼              ▼
Credit Winner   Create Recovery (5% Penalty to Winner)
      │              │
      └──────┬───────┘
             ▼
Distribute Dividends (Remainder to Group Creator)
             │
             ▼
Record Financial Transactions
```

---

# Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Parth-src/Rosca-System.git
cd Rosca-System
```

### 2. Configure Backend Environment

Configure your database and JWT secret in `src/main/resources/application.properties` or environment variables:

```properties
server.port=8081
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/rosca_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}

jwt.secret=${JWT_SECRET:defaultSecretKeyThatIsAtLeast32BytesLongForHS256Algorithm123}
```

### 3. Run Backend Service

```bash
# Compile and run with Maven Wrapper
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8081`**.

---

### 4. Run Frontend Client

```bash
cd frontend
npm install
npm run dev
```

The React frontend will start on **`http://localhost:8080`**.

---

# Author

**Parth Bhavsar**  
Information Technology Engineering Student  

**Tech Stack:** Java • Spring Boot • React • TypeScript • PostgreSQL • Spring Security • REST APIs
