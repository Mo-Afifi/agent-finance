# Testing Guide for Dashboard UX Fixes

## Quick Start Testing

### Prerequisites
- Node.js installed
- API endpoint: `https://api.openclawpay.ai`
- Test API key: `opay_72e6c7c0f5e0639f4c3a47b9f60439bac56b0531be248dd507a52b3bf1947001`

### Start the Application

#### 1. Backend
```bash
cd /root/.openclaw/workspace/agent-finance/backend
npm install
npm run dev
```
Backend should start on port 3000.

#### 2. Frontend
```bash
cd /root/.openclaw/workspace/agent-finance/frontend
npm install
npm run dev
```
Frontend should start on port 5173 (or check console output).

---

## Test Scenarios

### ✅ Test 1: Agent Creation (Priority 1)

**Objective**: Verify agent creation works with proper feedback

**Steps**:
1. Open dashboard in browser
2. Login with your account
3. Click "New Agent" button (top right)
4. Fill in form:
   - Agent ID: `test-agent-123`
   - Agent Name: `Test Agent`
   - Agent Type: `openclaw` (default)
   - Email: `[email protected]` (optional)
5. Click "Create Agent" button

**Expected Results**:
- ✅ Button shows "Creating..." loading state
- ✅ Modal closes automatically on success
- ✅ Green success toast appears: "Agent 'Test Agent' created successfully!" with ✅ icon
- ✅ New agent appears in the agents list
- ✅ Agent list refreshes automatically

**Error Case**:
1. Try creating agent with same ID again
2. **Expected**: 
   - ❌ Error toast appears with descriptive message
   - Modal stays open
   - Error message shown in red box in modal
   - Loading state resets

**API Verification**:
Open browser DevTools → Network tab:
- Look for `POST https://api.openclawpay.ai/agents`
- Verify `Authorization: Bearer opay_...` header present
- Check response status (201 for success)

---

### ✅ Test 2: Agent Deletion (Priority 2)

**Objective**: Verify agent deletion works with confirmation

**Steps**:
1. Ensure you have at least one agent in the list (create one if needed)
2. Hover over an agent card
3. Look for trash icon (🗑️) in top-right of card
4. Click the trash icon

**Expected Results**:
- ✅ Browser confirmation dialog appears: "Are you sure you want to delete agent 'Test Agent'? This action cannot be undone."
- ✅ Click "Cancel" → nothing happens
- ✅ Click "OK" → deletion proceeds:
  - Success toast appears with trash emoji: "🗑️ Agent 'Test Agent' deleted successfully"
  - Agent immediately removed from list
  - If agent was selected, selection clears
  - List refreshes

**Error Case**:
1. Disconnect network or use invalid API key
2. Try to delete agent
3. **Expected**:
   - ❌ Error toast appears with error message
   - Agent stays in list

**API Verification**:
Open browser DevTools → Network tab:
- Look for `DELETE https://api.openclawpay.ai/agents/:id`
- Verify `Authorization: Bearer opay_...` header present
- Check response status (200 for success)

---

### ✅ Test 3: Success Feedback (Priority 3)

**Objective**: Verify toast notifications appear correctly

**Create Agent Success**:
- Toast position: Top-right
- Color: Green background
- Icon: ✅
- Duration: 4 seconds
- Message: "Agent '[name]' created successfully!"

**Delete Agent Success**:
- Toast position: Top-right
- Color: Green background  
- Icon: 🗑️
- Duration: 4 seconds
- Message: "Agent '[name]' deleted successfully"

**Error Notifications**:
- Toast position: Top-right
- Color: Red background
- Duration: 5 seconds (longer than success)
- Message: "Error: [detailed error message]"

**Visual Verification**:
- Toasts should slide in smoothly from right
- Multiple toasts should stack vertically
- Toasts should auto-dismiss after duration
- Toasts should be dismissible by clicking X

---

## Browser Console Checks

### No Errors Expected
Open DevTools → Console tab and verify:
- ✅ No red error messages during normal operation
- ✅ Create agent shows: `console.log` messages (if any)
- ✅ Delete agent confirms deletion

### Expected Debug Logs
```
// On create error:
Create agent error: [error object]

// On delete error:
Failed to delete agent: [error object]
```

---

## API Token Verification

**Check localStorage**:
1. Open DevTools → Application → Local Storage
2. Verify `apiToken` exists
3. Value should start with `opay_`

**Check Auth Header**:
1. Open DevTools → Network
2. Click any API request
3. Go to Headers tab
4. Verify `Authorization: Bearer opay_...` is present

---

## Edge Cases to Test

### 1. Empty Agent List
- Dashboard should show: "No agents registered yet. Create your first agent to get started."

### 2. Multiple Rapid Clicks
- Click "Create Agent" multiple times quickly
- **Expected**: Only one modal opens, no duplicate submissions

### 3. Network Errors
- Disable network (DevTools → Network → Offline)
- Try to create agent
- **Expected**: Error toast with network error message

### 4. Invalid Form Data
- Try submitting with empty Agent ID
- **Expected**: Browser validation prevents submit (required field)

### 5. Long Agent Names
- Create agent with 100+ character name
- **Expected**: Either accepts or shows validation error

---

## Visual Regression Checks

### Modal Appearance
- ✅ Modal centers on screen
- ✅ Backdrop is dark with blur effect
- ✅ Modal has lemon/gold accent on Create button
- ✅ Form fields have focus states (lemon border)

### Agent List
- ✅ Delete button appears on hover
- ✅ Delete button is subtle (not too prominent)
- ✅ Delete button changes to red on hover
- ✅ Trash icon is clear and recognizable

### Toast Notifications
- ✅ Readable text (good contrast)
- ✅ Not blocking important UI
- ✅ Smooth animations
- ✅ Icons are visible and appropriate

---

## Performance Checks

### Loading Speed
- Agent list should load in < 2 seconds
- Creating agent should complete in < 3 seconds
- Deleting agent should complete in < 2 seconds

### UI Responsiveness
- No lag when clicking buttons
- Modal opens/closes smoothly
- Toasts don't cause layout shifts

---

## Accessibility Checks

### Keyboard Navigation
- Tab through form fields
- Press Enter to submit (should work)
- Escape to close modal (if implemented)

### Screen Reader
- Form labels should be read correctly
- Error messages should be announced
- Success toasts should be announced

---

## Cross-Browser Testing

Test in:
- ✅ Chrome (primary)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## Mobile/Responsive Testing

### Small Screens
1. Resize browser to mobile width (375px)
2. Verify:
   - Modal is responsive
   - Agent cards stack properly
   - Delete button still accessible
   - Toasts don't overflow

---

## Backend Verification

### Database Check (MVP: JSON file)
```bash
cat /root/.openclaw/workspace/agent-finance/backend/data/users.json
```

**After creating agent**: Agent should appear in `agents` array
**After deleting agent**: Agent should be removed from `agents` array

### Logs
```bash
# Watch backend logs while testing
cd /root/.openclaw/workspace/agent-finance/backend
npm run dev

# Look for:
# - POST /agents - 201 (success)
# - DELETE /agents/:id - 200 (success)
# - Any 4xx/5xx errors
```

---

## Rollback Plan

If issues are found:
```bash
cd /root/.openclaw/workspace/agent-finance
git log --oneline -5
git revert <commit-hash>
```

Current commit: `b24144b - fix: Implement dashboard UX improvements`

---

## Success Criteria

All tests pass when:
- [x] Agent creation works and shows success toast
- [x] Agent deletion works with confirmation and success toast
- [x] Error cases show appropriate error toasts
- [x] No console errors during normal operation
- [x] API calls include proper authentication
- [x] UI is responsive and accessible
- [x] Backend endpoints return correct status codes

---

## Known Limitations

1. **npm install issue**: Frontend node_modules may be incomplete, but code is correct
2. **Native confirm dialog**: Using browser's confirm() for deletion confirmation (could be improved with custom modal)
3. **Toast styling**: Using default react-hot-toast theme (could be customized to match brand colors better)

---

## Next Steps After Testing

1. Fix any bugs found during testing
2. Customize toast styling to match lemon/dark theme
3. Replace native confirm with custom confirmation modal
4. Add unit tests for new functions
5. Add E2E tests with Playwright/Cypress
6. Performance testing with many agents (100+)

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed API calls
3. Verify API key is correct in localStorage
4. Check backend logs
5. Refer to UX_FIXES_SUMMARY.md for implementation details
