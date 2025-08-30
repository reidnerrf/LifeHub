# Fix TypeScript Errors - Task 'completed' property

## Plan
- [ ] Fix line 1654: Replace `task.completed` with `task.status === "completed"`
- [ ] Fix line 1706: Replace `task.completed` with `task.status === "completed"` 
- [ ] Fix line 1725: Replace `task.completed` with `task.status === "completed"`
- [ ] Verify all changes work correctly

## Files to Edit
- backend/src/index.ts

## Current Status
- WeeklyQuest schema is correct and complete
- Task schema uses 'status' field with enum including 'completed'
- Need to replace incorrect 'completed' property usage with status checks
