# Admin Dashboard Deployment Guide

## Security Considerations

⚠️ **CRITICAL:** This admin dashboard provides full platform control. Deployment must be secured properly.

### Pre-Deployment Checklist

- [ ] Change default admin password in production
- [ ] Enable HTTPS/SSL
- [ ] Configure IP whitelisting if possible
- [ ] Set up VPN access for admin users
- [ ] Review and test all authentication flows
- [ ] Set up monitoring and alerting
- [ ] Configure session timeout
- [ ] Enable audit logging

## Environment Variables

Create a `.env` file with:

```bash
# Backend API URL
VITE_API_URL=https://api.yourplatform.com

# Admin password (CHANGE THIS!)
VITE_ADMIN_PASSWORD=your-super-secure-password-here
```

### Production Password Requirements

- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not stored in version control
- Rotated regularly (every 90 days)
- Consider using a password manager

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment Options

### Option 1: Static Hosting (Vercel/Netlify)

**Not Recommended for Production** - These platforms expose your dashboard publicly by default.

If you must use static hosting:
1. Build the project
2. Deploy the `dist/` folder
3. Configure custom domain with HTTPS
4. Set up Cloudflare Access or similar authentication layer

### Option 2: Self-Hosted (Recommended)

**Best for internal tools:**

1. **Set up a private server** (behind VPN or IP-restricted)
2. **Install Nginx:**
   ```bash
   sudo apt install nginx
   ```

3. **Configure Nginx:**
   ```nginx
   server {
       listen 443 ssl;
       server_name admin.yourplatform.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       # IP whitelist (optional but recommended)
       allow 203.0.113.0/24;  # Your office IP range
       deny all;
       
       root /var/www/admin-dashboard/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://backend-api:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Deploy files:**
   ```bash
   sudo mkdir -p /var/www/admin-dashboard
   sudo cp -r dist/* /var/www/admin-dashboard/dist/
   sudo systemctl reload nginx
   ```

### Option 3: Docker Container

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t admin-dashboard .
docker run -p 8080:80 admin-dashboard
```

### Option 4: Behind VPN (Most Secure)

1. Set up Tailscale/WireGuard VPN
2. Deploy admin dashboard on internal network
3. Access only through VPN connection
4. No public internet exposure

## Backend Requirements

The admin dashboard requires these backend endpoints:

```
GET  /api/admin/stats
GET  /api/admin/users
GET  /api/admin/users/:id
POST /api/admin/users/:id/suspend
POST /api/admin/users/:id/activate
GET  /api/admin/agents
GET  /api/admin/transactions
POST /api/admin/transactions/:id/flag
GET  /api/admin/transactions/export
GET  /api/admin/activity
GET  /api/admin/health
GET  /api/admin/config
PUT  /api/admin/config
```

Make sure your backend has these routes implemented and protected with proper authentication.

## Production Enhancements

### 1. Add Backend Authentication

Instead of client-side password check, implement proper JWT authentication:

```typescript
// Backend endpoint
POST /api/admin/login
{
  "username": "admin",
  "password": "secure-password"
}

// Returns JWT token
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Update admin dashboard to:
1. Send credentials to backend
2. Store JWT token
3. Include token in all API requests
4. Handle token expiration

### 2. Add Audit Logging

Log all admin actions:
```typescript
{
  "timestamp": "2026-02-08T16:00:00Z",
  "admin": "mo@openclaw.com",
  "action": "suspend_user",
  "target": "user_123",
  "ip": "203.0.113.42"
}
```

### 3. Add Two-Factor Authentication

Integrate TOTP (Google Authenticator):
```bash
npm install otpauth qrcode
```

### 4. Session Management

- Auto-logout after 15 minutes of inactivity
- Force logout on suspicious activity
- Track concurrent sessions

### 5. Rate Limiting

Add rate limiting to prevent brute force:
```typescript
// Max 5 login attempts per 15 minutes
// Lock account after 10 failed attempts
```

## Monitoring

### Set Up Alerts

Monitor for:
- Failed login attempts
- Unusual admin activity
- System errors
- Performance degradation

### Logging

Use structured logging:
```typescript
{
  "level": "info",
  "action": "user_suspended",
  "userId": "user_123",
  "admin": "mo@openclaw.com",
  "timestamp": "2026-02-08T16:00:00Z"
}
```

## Access Control

### Recommended Setup

1. **Admin Tiers:**
   - Super Admin: Full access
   - Support Admin: View-only + limited actions
   - Finance Admin: Transaction management only

2. **IP Whitelisting:**
   - Office IP ranges
   - VPN endpoints only
   - Home IPs for remote work (with 2FA)

3. **Time-Based Access:**
   - Office hours only (optional)
   - Alert on after-hours access

## Maintenance

### Regular Tasks

- [ ] Rotate admin password every 90 days
- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Test disaster recovery quarterly
- [ ] Review access permissions quarterly

### Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Rebuild and redeploy
npm run build
```

## Disaster Recovery

### Backup Checklist

- [ ] Database backups (automated daily)
- [ ] Configuration backups
- [ ] Audit log archives
- [ ] Admin credentials (secure vault)

### Recovery Plan

1. Identify the issue
2. Notify stakeholders
3. Switch to maintenance mode
4. Restore from backup
5. Verify integrity
6. Resume operations
7. Post-mortem analysis

## Troubleshooting

### Can't Login

1. Check `.env` file for correct password
2. Clear browser cache/sessionStorage
3. Check browser console for errors
4. Verify backend API is running

### API Errors

1. Check backend logs
2. Verify API URL in `.env`
3. Check CORS configuration
4. Verify admin endpoints are registered

### Performance Issues

1. Check browser network tab
2. Monitor backend response times
3. Review database query performance
4. Check for memory leaks

## Support

For issues or questions:
1. Check logs first
2. Review documentation
3. Contact platform team
4. Emergency: Page on-call engineer
