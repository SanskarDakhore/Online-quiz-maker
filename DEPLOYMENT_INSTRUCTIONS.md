# Deployment Instructions for Vercel

This document provides instructions for deploying the Quiz Maker Application to Vercel.

## Prerequisites

1. MongoDB Atlas cluster set up with:
   - Proper IP access list configured
   - Database user created with read/write permissions
   - Connection string ready

2. MongoDB Atlas API keys for cluster management (optional, for automatic activation):
   - Public API key
   - Private API key
   - Project Group ID
   - Cluster name

3. A Vercel account

## Environment Variables

The following environment variables need to be set in your Vercel project:

### Required Variables:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token generation (use a strong random string)

### Optional Variables (for automatic database activation):
- `ATLAS_PUBLIC_KEY` - MongoDB Atlas Public API Key
- `ATLAS_PRIVATE_KEY` - MongoDB Atlas Private API Key
- `ATLAS_GROUP_ID` - MongoDB Atlas Project Group ID
- `ATLAS_CLUSTER_NAME` - Name of your MongoDB Atlas cluster

## Deployment Steps

1. Fork or clone this repository

2. Import the project into Vercel:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

3. Add environment variables in Vercel dashboard:
   - Go to your project dashboard
   - Navigate to Settings > Environment Variables
   - Add the required environment variables listed above

4. Wait for the build to complete

5. Your application will be deployed and accessible at the provided URL

## Automatic Database Activation

When users visit your deployed application, the following happens automatically:
1. The frontend detects if the database is inactive
2. If the database is paused (common with free-tier MongoDB Atlas clusters), it sends a request to resume the cluster
3. The database cluster starts up (this may take 1-3 minutes for free-tier clusters)
4. The application periodically checks the database status and provides feedback to the user

## Troubleshooting

### Common Issues:

1. **"Cannot connect to the server" error**:
   - Verify that your `MONGODB_URI` is correct
   - Ensure your MongoDB Atlas cluster IP access list includes Vercel's IP ranges
   - Check that the database user has proper permissions

2. **Database activation not working**:
   - Verify that your Atlas API keys are correct and have the necessary permissions
   - Check that the group ID and cluster name match your MongoDB Atlas configuration

3. **Authentication issues**:
   - Ensure `JWT_SECRET` is set and kept secure
   - Make sure the secret is complex and not shared publicly

### Verification Steps:

1. Check that the health endpoint works: `https://your-app.vercel.app/api/health`
2. Verify the database activation endpoint: `https://your-app.vercel.app/api/activate-db`
3. Test the auth endpoints are accessible

## Notes

- The application uses serverless functions for API endpoints, which are cost-effective for low-traffic applications
- Free-tier MongoDB Atlas clusters automatically pause after 30 minutes of inactivity, which is why the automatic activation feature is useful
- The application includes fallback mechanisms for when the database is temporarily unavailable