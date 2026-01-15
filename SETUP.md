# Quick Setup Guide

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed
- PostgreSQL installed and running
- Cloudinary account (for image uploads)
- Razorpay account (for payments)

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example and fill in your values)
# SECRET_KEY=your-secret-key
# DEBUG=True
# DB_NAME=ecommerce_db
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_HOST=localhost
# DB_PORT=5432
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
# RAZORPAY_KEY_ID=your-razorpay-key
# RAZORPAY_KEY_SECRET=your-razorpay-secret

# Create PostgreSQL database
createdb ecommerce_db

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
# REACT_APP_API_URL=http://localhost:8000/api

# Start development server
npm start
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

## Adding Sample Data

1. Log in to the admin panel at http://localhost:8000/admin
2. Create categories (Skin, Body, Hair, Fragrances, Gifting)
3. Add products with images (uploaded via Cloudinary)
4. Mark some products as trending or bestseller

## Testing Payment Integration

1. Use Razorpay test credentials
2. Test payment flow with test card numbers provided by Razorpay
3. Verify payment in the admin panel

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in .env file
- Verify database exists: `psql -l`

### CORS Errors
- Check CORS_ALLOWED_ORIGINS in settings.py
- Ensure frontend URL matches the allowed origins

### Image Upload Issues
- Verify Cloudinary credentials
- Check CLOUDINARY_STORAGE settings
- Ensure images are properly formatted

### Payment Issues
- Verify Razorpay credentials
- Check Razorpay dashboard for API keys
- Ensure test mode is enabled for development


