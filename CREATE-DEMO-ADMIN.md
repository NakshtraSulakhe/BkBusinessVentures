# Create Demo Admin User

## Method 1: Using curl (Recommended)

Run this command in your terminal from the project root:

```bash
curl -X POST http://localhost:3000/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Admin",
    "email": "admin@bkbusiness.com", 
    "password": "admin123",
    "role": "admin"
  }'
```

## Method 2: Using Node Script

1. Make sure your development server is running
2. Run the script:
```bash
node create-demo-admin.js
```

## Demo Admin Credentials

Once created, you can login with:
- **Email**: admin@bkbusiness.com
- **Password**: admin123
- **Role**: Administrator

## Next Steps

1. Start your development server: `npm run dev`
2. Create the demo admin user using one of the methods above
3. Login at: http://localhost:3000/login
4. Navigate to: http://localhost:3000/dashboard/users
5. Use the "Add User" button to create more users with operator or admin roles

## Important Notes

- The first user can be created without authentication
- After the first user exists, all subsequent user creation requires authentication
- Only admin users can create other admin users
- Operators can only be created by admin users
