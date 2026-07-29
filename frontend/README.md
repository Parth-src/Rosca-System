# Circl Frontend 🔄

Circl brings chit funds, tandas, susus, and paluwagans onto a transparent auction-based savings platform with trust scoring and instant payouts. This is the frontend web application for the Circl platform.

## 🚀 Tech Stack

This frontend is built with modern web technologies:
- **Framework:** [TanStack Start](https://tanstack.com/start) / React
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query)

## 🛠️ Local Development

To run the frontend locally, you will need Node.js and npm installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   By default, the app expects the Spring Boot backend to be running on `http://localhost:8080`.
   If your backend is running elsewhere, create a `.env` file in this directory and set:
   ```env
   VITE_API_BASE_URL=http://your-backend-url:port
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 🎨 UI & Theming
The application uses a custom Tailwind configuration (`tailwind.config.js`) tailored for Circl's branding, featuring custom fonts (Inter & Fraunces) and a carefully designed color palette.

## 🔗 Backend Connection
This frontend is designed to work in tandem with the **Rosca System Spring Boot Backend**. Ensure the backend is running and properly exposing the `/api` endpoints for the frontend to function correctly.
