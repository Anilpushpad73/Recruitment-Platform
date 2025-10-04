# MongoDB Atlas Setup Guide

Follow these steps to set up MongoDB Atlas for your recruitment platform:

## 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign up for a free account or log in if you already have one

## 2. Create a New Cluster
1. Click "Create a New Cluster" or "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Give your cluster a name (e.g., "RecruitmentPlatform")
5. Click "Create Cluster"

## 3. Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Enter a username and secure password
5. Set database user privileges to "Read and write to any database"
6. Click "Add User"

## 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add only your specific IP addresses
5. Click "Confirm"

## 5. Get Connection String
1. Go back to "Database" (Clusters)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as the driver
5. Copy the connection string

## 6. Update Environment Variables
1. Open your `.env` file in the project root
2. Replace the MONGODB_URI with your connection string:
   ```
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.abc123.mongodb.net/recruitment_platform?retryWrites=true&w=majority
   ```
3. Replace `yourusername` and `yourpassword` with your actual database user credentials
4. Replace `cluster0.abc123.mongodb.net` with your actual cluster URL

## 7. Test Connection
1. Save the `.env` file
2. Run `npm run server:dev`
3. You should see "MongoDB Connected" in the console

## Example .env Configuration
```env
MONGODB_URI=mongodb+srv://myuser:mypassword123@cluster0.mongodb.net/recruitment_platform?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Security Best Practices
- Use a strong, unique password for your database user
- In production, restrict network access to specific IP addresses
- Keep your connection string secure and never commit it to version control
- Use environment variables for all sensitive configuration

## Troubleshooting
- **Authentication failed**: Check your username and password in the connection string
- **Network timeout**: Ensure your IP address is whitelisted in Network Access
- **Database not found**: The database will be created automatically when you first insert data
- **Connection string format**: Ensure you're using the correct format with proper URL encoding for special characters in passwords