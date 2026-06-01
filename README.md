# Laboratory Equipment Management System — LEMS

## Project Information

**Project Name:** Laboratory Equipment Management System — LEMS
**Team:** Team 7
**Semester:** Spring 2026
**Course Project:** Software Engineering & Database Management Systems

## Team Members

* Hüsna Betül Patat
* Ömer Faruk Akdağ
* Muhammed Sıtkı Küçük
* Abdullah Kerem Göktaş

---

## Project Description

LEMS is a full-stack web application developed to manage laboratory equipment reservations in an organized, efficient, and fair way.

The main problem addressed by this project is the limited number of laboratory resources compared to the high number of students who may need to use them. Instead of managing equipment reservations manually, LEMS provides a centralized system where users can view equipment availability, reserve available time slots, and track their reservations.

Administrators can manage users, equipment records, reservations, and system statistics through an admin panel.

---

## Main Features

### User Features

* Register and log in
* View profile information
* Select laboratory equipment
* Make reservations through a calendar-based interface
* View personal reservation history
* Switch between English and Turkish

### Admin Features

* View admin dashboard
* Manage users
* Manage equipment records
* Monitor reservations
* Access role-based admin pages

---

## Technologies Used

### Frontend

* React
* Vite
* React Router
* i18next / localization support

### Backend

* Node.js
* Express.js
* MySQL2
* JSON Web Token
* dotenv

### Database

* MySQL

---

## Project Structure

```text
LEMS_Source_Code/
│
├── backend/
├── frontend/
├── DATABASE/
├── README.md
└── .env.example
```

---

## Database Setup

1. Open MySQL Workbench.
2. Create the database:

```sql
CREATE DATABASE lems_db;
USE lems_db;
```

3. Run the schema file:

```text
DATABASE/schema.sql
```

4. If available, run the seed data file:

```text
DATABASE/seed_data.sql
```

The main database tables are:

* roles
* users
* laboratories
* equipment
* reservations
* blocked_time_slots

---

## Environment Variables

Create a `.env` file inside the `backend` folder.

Use this format:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lems_db
JWT_SECRET=your_jwt_secret_key
```

Do not include the real `.env` file in the final submission. Use `.env.example` instead.

---

## Running the Project

### Backend

```bash
cd backend
npm install
npm start
```

If `npm start` is not configured:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## Application Flow

1. Start MySQL Server.
2. Run the backend server.
3. Run the frontend server.
4. Open the application in the browser.
5. Register or log in.
6. Select equipment and create a reservation.
7. Admin users can manage users, equipment, and reservations from the admin panel.

---

## Submission Notes

The final submission should include:

```text
LEMS_Project_Report.docx
LEMS_Project_Presentation.pptx
LEMS_Source_Code/
```

The following files/folders should not be included:

```text
node_modules/
.env
dist/
build/
.git/
```

---

## Future Improvements

* Email reservation notifications
* QR code-based equipment check-in/check-out
* Equipment fault reporting
* Advanced admin analytics
* Cloud deployment
