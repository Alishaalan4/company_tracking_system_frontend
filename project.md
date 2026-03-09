📌 FRONTEND API SUMMARY (BASED ON YOUR ROUTES)


Base URL:


http://127.0.0.1:8000/api/


All routes below are relative to /api.

🔐 AUTH ROUTES

Prefix: /auth

Method	Endpoint	Description
POST	/auth/login	Login with email + password
POST	/auth/login/pin	Login with email + PIN
POST	/auth/logout	Logout (auth required)
GET	/auth/me	Get current user
POST	/auth/change-password	Change password
POST	/auth/change-pin	Change attendance PIN
POST	/auth/forgot-password	Send reset link
POST	/auth/reset-password	Reset password
⏱ ATTENDANCE

Prefix: /attendance

Middleware:

auth:sanctum

role:employee,manager,admin

Method	Endpoint	Description
POST	/attendance/check-in	Check-in with PIN
POST	/attendance/check-out	Check-out with PIN
POST	/attendance/check	Combined check logic
GET	/attendance/history	Get own attendance history
📝 LEAVES

Prefix: /leaves

Method	Endpoint	Description
POST	/leaves	Submit leave
GET	/leaves	List own leaves
PUT	/leaves/{id}	Update leave (admin only)
DELETE	/leaves/{id}	Delete leave (admin only)
🔁 BACKWARD COMPATIBILITY

Alias for frontend flexibility:

Prefix: /leave-requests

Same functionality as /leaves.

🔔 NOTIFICATIONS

Prefix: /notifications

Method	Endpoint	Description
GET	/notifications	Get user notifications
POST	/notifications/{id}/read	Mark notification as read
📊 REPORTS

Prefix: /reports

Middleware:

auth:sanctum

role:admin,manager

department.scope

Method	Endpoint	Description
GET	/reports/daily	Daily attendance report
GET	/reports/monthly	Monthly report
GET	/reports/summary	System summary stats
GET	/reports/export/pdf	Export PDF
GET	/reports/export/excel	Export Excel
👑 ADMIN-ONLY ROUTES (NO PREFIX)

These routes are protected by:

middleware(['auth:sanctum','role:admin'])

But URL does NOT include /admin.

🏢 Departments
Method	Endpoint	Description
GET	/departments	List departments
POST	/departments	Create department
GET	/departments/{id}	Get department
PUT	/departments/{id}	Update department
DELETE	/departments/{id}	Delete department
📅 Leave Types
Method	Endpoint	Description
GET	/leave-types	List leave types
POST	/leave-types	Create leave type
PUT	/leave-types/{id}	Update leave type
DELETE	/leave-types/{id}	Delete leave type
📆 Non Working Days
Method	Endpoint	Description
GET	/non-working-days	List holidays
POST	/non-working-days	Add holiday
PUT	/non-working-days/{id}	Update holiday
DELETE	/non-working-days/{id}	Delete holiday
👥 Users
Method	Endpoint	Description
GET	/users	List users
POST	/users	Create user
GET	/users/{id}	Get user
PUT	/users/{id}	Update user
DELETE	/users/{id}	Delete user
POST	/users/{id}/resend-credentials	Resend login credentials
⚙ Settings
Method	Endpoint	Description
GET	/settings	Get system settings
POST	/settings	Update settings
📜 Audit Logs
Method	Endpoint	Description
GET	/audit-logs	View system logs
🧠 FRONTEND PROMPT (YOU CAN USE THIS TO BUILD UI)

Here is a clean prompt you can use in AI frontend builder:

Build a React (Vite + TypeScript) admin dashboard for a Smart Attendance & Leave Management System.

The backend is a Laravel API using token-based authentication (Sanctum).

API base URL: /api

Authentication:

Login via /auth/login

Store token

Attach token as Bearer to all requests

Redirect to login on 401

Roles:

admin

manager

employee

Route access must be role-based.

Main modules:

Employee:

Dashboard

Check-in / Check-out

Attendance History

My Leaves

Notifications

Manager:

Department Reports

Attendance Reports

Admin:

Users CRUD

Departments CRUD

Leave Types CRUD

Non-Working Days CRUD

Reports (daily/monthly/export)

Audit Logs

Settings



Axios instance

Protected routes

Sidebar navigation

Role-based menu rendering