# Parcel Management System

A comprehensive parcel management system built with FastAPI backend and HTML/CSS/JS frontend. Features multiple user roles (Admin and Customer), parcel tracking, and a responsive dashboard.

## Features

### User Roles

#### Admin
- Dashboard with system statistics
- View all parcels
- Update parcel status
- Add tracking events
- Manage users
- View revenue reports

#### Customer
- User registration and login
- Dashboard overview
- Create and send parcels
- Track parcels with real-time status
- View sent and received parcels
- Update profile information

### Parcel Management
- Create parcels with detailed information
- Automatic tracking number generation
- Status updates: Pending → Picked Up → In Transit → Out for Delivery → Delivered
- Full tracking history with timestamps
- Weight, dimensions, and category tracking
- Cost calculation

## Technology Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Authentication**: JWT tokens with OAuth2
- **Templating**: Jinja2
- **Styling**: Custom CSS with responsive design

## Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd ParcelMgmt
   ```

3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

4. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

6. Navigate to the app directory and run the application:
   ```bash
   cd app
   python main.py
   ```

7. Open your browser and go to: http://localhost:8000

## Default Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Customer**: Create an account through the registration page

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update user profile

### Parcels
- `POST /api/parcels/create` - Create a new parcel
- `GET /api/parcels/my-parcels` - Get all user's parcels
- `GET /api/parcels/sent` - Get parcels sent by user
- `GET /api/parcels/received` - Get parcels received by user
- `GET /api/parcels/track/{tracking_number}` - Track a parcel
- `GET /api/parcels/{parcel_id}` - Get parcel details

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/{user_id}` - Get specific user
- `GET /api/admin/recent-parcels` - Get recent parcels
- `PUT /api/admin/users/{user_id}` - Update user
- `DELETE /api/admin/users/{user_id}` - Delete user

### Parcel Admin
- `GET /api/parcels/admin/all` - Get all parcels (admin only)
- `PUT /api/parcels/admin/{parcel_id}` - Update parcel (admin only)
- `POST /api/parcels/admin/{parcel_id}/tracking` - Add tracking event (admin only)
- `DELETE /api/parcels/admin/{parcel_id}` - Delete parcel (admin only)

## Project Structure

```
ParcelMgmt/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── routers/
│   │   ├── auth.py          # Auth routes
│   │   ├── parcels.py       # Parcel routes
│   │   └── admin.py         # Admin routes
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css    # Main stylesheet
│   │   └── js/
│   │       └── main.js      # Main JavaScript file
│   └── templates/
│       ├── base.html        # Base template
│       ├── index.html       # Home page
│       ├── login.html       # Login page
│       ├── register.html    # Registration page
│       ├── dashboard.html   # Customer dashboard
│       ├── admin_dashboard.html  # Admin dashboard
│       ├── track.html       # Track parcel page
│       ├── create_parcel.html  # Create parcel page
│       └── my_parcels.html  # My parcels page
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Parcel Status Flow

1. **Pending** - Parcel registered, waiting for pickup
2. **Picked Up** - Parcel collected from sender
3. **In Transit** - Parcel is being transported
4. **Out for Delivery** - Parcel is with delivery agent
5. **Delivered** - Parcel successfully delivered
6. **Cancelled** - Delivery cancelled

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API endpoints
- SQL injection prevention via SQLAlchemy
- XSS protection via proper escaping

## Development

To run in development mode with auto-reload:

```bash
cd app
uvicorn main:app --reload
```

## License

This project is open source and available for educational purposes.
