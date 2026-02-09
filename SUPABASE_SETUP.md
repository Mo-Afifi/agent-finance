# Supabase PostgreSQL Setup for OpenClaw Pay

**Status:** Database created ✅  
**Connection String:** `postgresql://postgres:3XxTM#HH@TmM+C_@db.isfkcikcyploakzmolkt.supabase.co:5432/postgres`

---

## 🔧 **Step 1: Run Database Schema** (YOU DO THIS)

### **In Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard
2. Select your **openclaw-pay** project
3. Click **"SQL Editor"** in left sidebar (📝 icon)
4. Click **"New Query"**
5. Copy the entire schema from: `/root/.openclaw/workspace/agent-finance/backend/src/db/schema.sql`
6. Paste it into the SQL editor
7. Click **"Run"** (or press Cmd+Enter)

**Expected result:** 
```
Success. No rows returned
```

This creates 3 tables: `users`, `agents`, `waitlist`

---

## 🔧 **Step 2: Update Render Environment Variables** (YOU DO THIS)

### **In Render Dashboard:**

1. Go to: https://dashboard.render.com
2. Find your backend service: `agent-finance-backend`
3. Click **"Environment"** in left sidebar
4. Add NEW environment variable:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:3XxTM#HH@TmM+C_@db.isfkcikcyploakzmolkt.supabase.co:5432/postgres`
5. Click **"Save Changes"**

Render will auto-redeploy (takes ~2-3 min)

---

## 🔧 **Step 3: I'll Update the Code** (I DO THIS)

While you do Steps 1 & 2, I'll:
1. Create a new `db-storage.ts` that uses PostgreSQL instead of JSON files
2. Update the code to use the database
3. Keep backward compatibility (falls back to JSON if DATABASE_URL not set)
4. Commit and push

---

## ⏰ **Timeline:**

- **You:** Steps 1 & 2 (~5 minutes)
- **Me:** Update code (~5 minutes)
- **Render:** Redeploy (~2 minutes)
- **Total:** ~12 minutes to permanent storage!

---

## 📋 **After This Works:**

✅ Data persists across redeploys  
✅ No more losing users/agents  
✅ Admin dashboard shows real data  
✅ Production-ready storage  

---

**Start with Step 1 (run the SQL schema in Supabase) and tell me when it's done!** 

I'll start updating the code now. 🚀
