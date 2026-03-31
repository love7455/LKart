# LKart - E-commerce Project

LKart is a full-stack e-commerce web app built with React + Vite (frontend), Node.js + Express (backend), MongoDB, Razorpay, and Cloudinary.

## Features
- User auth with OTP verification and OTP-based password reset
- Product listing, filtering, search, sorting, product detail
- Cart management and Razorpay checkout
- Order creation and status tracking
- Wishlist
- Help Center + Contact Us (support ticket creation)
- Admin panel:
  - Manage products (add/update/delete)
  - Manage support tickets

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Redux Toolkit
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas
- Payments: Razorpay (test/live)
- Media storage: Cloudinary

## Project Structure
- `frontEnd/my-project` - React frontend
- `BackEnd` - Express backend

## Local Setup
### 1) Backend
```bash
cd BackEnd
npm install
```

Create `.env` from example:
```bash
cp .env.example .env
```

Start backend:
```bash
npm start
```

### 2) Frontend
```bash
cd frontEnd/my-project
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8000`

## Demo Readiness Checklist
1. Ensure MongoDB is connected.
2. Login as admin.
3. Open `Manage Products` and verify products are visible.
4. Place a test order using Razorpay test mode.
5. Check order in `My Orders`.
6. Raise support ticket from `Contact Us`.
7. Manage ticket status from `Admin Support`.

## Test Payment (Razorpay)
- Use `RAZORPAY_KEY_ID=rzp_test_...` and test secret in backend `.env`.
- For UPI in test mode:
  - success: `success@razorpay`
  - failure: `failure@razorpay`

## Useful APIs
- Health check: `GET /api/v1/health`
- Register: `POST /api/v1/user/register`
- Verify OTP (signup): `POST /api/v1/user/verify`
- Login: `POST /api/v1/user/login`
- Products: `GET /api/v1/products/get-all-products`
- Cart: `POST /api/v1/cart/add-to-cart`
- Payment order create: `POST /api/v1/payment/create-order`
- Payment verify: `POST /api/v1/payment/verify-payment`
- My orders: `GET /api/v1/orders/my-orders`
- Support ticket create: `POST /api/v1/support/contact`

## Security Notes
- Never commit real `.env` secrets to git.
- Rotate exposed credentials immediately if shared.
- Use strong JWT secret and app passwords for Gmail SMTP.
