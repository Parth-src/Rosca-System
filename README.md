<div align="center">

# ROSCA System

### Secure Digital Rotating Savings and Credit Association (ROSCA) Backend

A Spring Boot backend application that digitizes traditional Rotating Savings and Credit Association (ROSCA) groups through secure authentication, automated auction-based fund allocation, wallet management, recovery handling, dynamic trust scoring, and financial reporting.

![Java](https://img.shields.io/badge/Java-21-red)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-success)
![JPA](https://img.shields.io/badge/JPA-Hibernate-orange)
![Maven](https://img.shields.io/badge/Maven-Build-red)

</div>

---

# Overview

A Rotating Savings and Credit Association (ROSCA) is a community-driven financial model where members contribute a fixed amount of money at regular intervals. During each cycle, one member receives the pooled amount until every participant has received it once.

Traditional ROSCA systems rely heavily on manual bookkeeping and trust between members, which often leads to payment defaults, lack of transparency, delayed settlements, and calculation errors.

ROSCA System digitizes this entire process by providing a secure backend that automates group management, auctions, financial settlements, wallet transactions, recovery handling, and member trust evaluation through REST APIs.

---

# Key Features

### Authentication & Security

- JWT-based authentication
- BCrypt password encryption
- Stateless authentication using Spring Security

### User Management

- User registration
- Secure login
- User profile management

### Group Management

- Create ROSCA groups
- Manage group details
- Track active members

### Membership Management

- Join savings groups
- Membership validation
- Member tracking

### Auction System

- Scheduled auctions
- Bid placement
- Automatic winner selection

### Wallet System

- Contribution deduction
- Winner payouts
- Dividend credits
- Recovery payments
- Penalty deductions

### Settlement Engine

- Automatic contribution collection
- Winner allocation
- Dividend distribution
- Transaction recording

### Recovery Engine

- Detect payment defaults
- Create recovery records
- Apply penalties
- Complete pending recoveries

### Dynamic Trust Engine

Trust score updates based on:

- Successful contributions
- Payment defaults
- Recovery completion

### Financial Reporting

Generate reports containing:

- Total Investment
- Total Received
- Winning Amount
- Dividend Earned
- Recovery Amount
- Penalty Paid
- Net Profit
- ROI
- Trust Score

---

# Technology Stack

| Category | Technology |
|-----------|------------|
| Language | Java 21 |
| Framework | Spring Boot |
| Security | Spring Security + JWT |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Build Tool | Maven |
| API | REST APIs |
| Scheduling | Spring Scheduler |

---

# High-Level Architecture

```text
                   REST Client
                        │
                        ▼
             Spring Boot REST API
                        │
        ┌───────────────┼────────────────┐
        │               │                │
 Authentication    Business Logic    Scheduler
      (JWT)          Services      Background Jobs
                        │
                 Spring Data JPA
                        │
                   PostgreSQL
```

The application follows a layered architecture that separates controllers, services, repositories, and database access. This improves maintainability, readability, and scalability while keeping business logic isolated from infrastructure concerns.

---

# Core Modules

| Module | Description |
|---------|-------------|
| Authentication | User registration, login, JWT generation and validation |
| User | User profile management |
| Group | ROSCA group creation and management |
| Membership | User-group relationship management |
| Auction | Auction creation, bidding, and winner selection |
| Wallet | Balance management and financial operations |
| Settlement | Automated financial settlement after auctions |
| Recovery | Recovery processing for payment defaults |
| Trust | Dynamic trust score management |
| Transaction | Financial transaction history |
| Reports | Performance analytics |
| Scheduler | Automated auction and recovery processing |

---

# Database Design

The application uses PostgreSQL as its relational database and Spring Data JPA for object-relational mapping.

## Core Entities

- User
- Wallet
- Group
- Membership
- Auction
- Bid
- Transaction
- Recovery

### Entity Relationship

```text
User
 │
 ├── Wallet
 │
 ├── Membership
 │      │
 │      ▼
 │    Group
 │      │
 │      ▼
 │   Auction
 │      │
 │      ▼
 │     Bid
 │
 ├── Transaction
 │
 └── Recovery
```

Each entity represents a specific business domain while maintaining clear relationships to ensure consistency and traceability across all financial operations.

---

# Project Structure

```text
src
└── main
    ├── java
    │   └── com.rosca
    │       ├── config
    │       ├── controller
    │       ├── dto
    │       ├── entity
    │       ├── enums
    │       ├── exception
    │       ├── repository
    │       ├── scheduler
    │       ├── security
    │       ├── service
    │       └── util
    │
    └── resources
        └── application.properties
```

The project follows a layered architecture where each package has a well-defined responsibility, making the codebase modular and easier to maintain.

---

# Authentication

The application uses **Spring Security** with **JWT (JSON Web Tokens)** for stateless authentication. Passwords are securely stored using **BCrypt hashing**, ensuring that sensitive credentials are never persisted in plain text.

### Authentication Flow

```text
Register
    │
    ▼
BCrypt Password Encoding
    │
    ▼
Save User to Database

----------------------------

Login
    │
    ▼
Authentication Manager
    │
    ▼
Generate JWT Token
    │
    ▼
Return JWT

----------------------------

Protected Request
    │
Authorization: Bearer <JWT>
    │
    ▼
JWT Filter
    │
    ▼
Validate Token
    │
    ▼
Access Protected API
```

---

# Wallet System

Each registered user is assigned a wallet that serves as the central component for all financial transactions within the platform.

The wallet is responsible for:

- Maintaining account balance
- Deducting member contributions
- Crediting auction winners
- Distributing dividends
- Processing recovery payments
- Recording penalties

Every financial operation updates the wallet and creates a corresponding transaction record, ensuring complete transparency and traceability.

---

# Auction System

The auction module determines which member receives the pooled contribution for a cycle.

### Features

- Scheduled auction creation
- Bid placement by eligible members
- Automatic winner determination
- Auction status management

### Auction Lifecycle

```text
Auction Created
      │
      ▼
Auction Opens
      │
      ▼
Members Place Bids
      │
      ▼
Auction Closes
      │
      ▼
Winner Selected
      │
      ▼
Settlement Triggered
```

---

# Settlement Engine

The Settlement Engine automates the complete financial distribution process after an auction ends.

It performs the following operations:

- Collect member contributions
- Detect failed contributions
- Credit the auction winner
- Calculate dividends
- Record every financial transaction
- Update wallet balances

### Settlement Workflow

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
Credit Winner   Create Recovery
      │              │
      └──────┬───────┘
             ▼
Distribute Dividend
             │
             ▼
Record Transactions
```

---

# Recovery Engine

To prevent payment defaults from interrupting the savings cycle, the application includes an automated recovery mechanism.

When a contribution fails:

- A recovery record is created
- A penalty is applied
- The settlement continues
- Recovery is processed once sufficient funds become available

### Recovery Workflow

```text
Contribution Due
       │
       ▼
Wallet Balance Check
       │
       ├───────────────┐
       │               │
Enough Balance    Insufficient Balance
       │               │
       ▼               ▼
Continue       Create Recovery
Settlement      Apply Penalty
                       │
                       ▼
             Recovery Scheduler
                       │
                       ▼
              Recovery Completed
```

---

# Dynamic Trust Engine

Each user maintains a **dynamic trust score** that reflects their financial behavior within the platform.

The score is automatically updated based on user activity.

### Trust increases after

- Successful contribution payments
- Successful recovery completion

### Trust decreases after

- Contribution defaults

This mechanism helps evaluate member reliability for future savings groups.

---

# Transaction Ledger

Every financial activity performed within the system is stored as a transaction.

Supported transaction types include:

- Contribution
- Allocation
- Dividend
- Penalty
- Recovery

This provides a complete financial audit trail for every member.

---

# Performance Reports

The application generates financial summaries for every member.

The report includes:

- Total Investment
- Total Amount Received
- Winning Amount
- Dividend Earned
- Recovery Amount
- Penalty Paid
- Net Profit
- Return on Investment (ROI)
- Current Trust Score

These reports provide members with a consolidated view of their financial performance within the ROSCA system.

---

# Background Scheduling

The application uses **Spring Scheduler** to automate recurring operations.

### Auction Scheduler

Responsible for:

- Opening scheduled auctions
- Closing expired auctions
- Triggering settlement

### Recovery Scheduler

Responsible for:

- Processing pending recoveries
- Updating wallet balances
- Completing recovery transactions
- Updating trust scores

---

# API Overview

| Module | Operations |
|---------|------------|
| Authentication | Register, Login |
| Users | Profile Management |
| Groups | Create & Manage Groups |
| Membership | Join Groups |
| Auctions | Create Auctions, Place Bids |
| Wallet | View Wallet Details |
| Transactions | Transaction History |
| Reports | Performance Report |

---

# Getting Started

### Clone the Repository

```bash
git clone https://github.com/Parth-src/ROSCA-System.git
cd ROSCA-System
```

### Configure Database

Create a PostgreSQL database and update your `application.properties` file.

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}
```

### Run the Application

```bash
mvn clean install
mvn spring-boot:run
```

The application will start on:

```
http://localhost:8080
```

---

# Future Enhancements

The current implementation focuses on building a secure and automated backend. Future improvements include:

- Redis for caching frequently accessed data
- Apache Kafka for event-driven processing
- Docker containerization
- CI/CD pipeline integration
- Frontend application using React
- Email notifications

---

# Author

**Parth Bhavsar**

Information Technology Engineering Student

**Tech Stack:** Java • Spring Boot • PostgreSQL • Spring Security • REST APIs

---
