# Phase 2: User Experience & Features Implementation

## ✅ Completed
- [x] Real-time editing with WebSocket (already implemented)
- [x] Basic version history (already implemented)

## 🔄 In Progress

### 1. Sharing & Collaboration
- [ ] Extend backend schema for sharing permissions
- [ ] Add comment system schema
- [ ] Create sharing modal with permission levels (view, edit, admin)
- [ ] Add sharing endpoints to backend
- [ ] Add comment endpoints to backend
- [ ] Create comment UI components
- [ ] Enhanced change tracking UI

### 2. Backup & Versioning
- [ ] Manual backup/restore functionality
- [ ] Version comparison UI
- [ ] Enhanced version history display

### 3. Offline Mode
- [ ] Add WatermelonDB dependency
- [ ] Create offline database schema
- [ ] Implement sync queue and conflict resolution
- [ ] Add offline indicator in UI
- [ ] Offline sync management

## 📋 Implementation Steps

### Step 1: Backend Schema Extensions
1. Add sharing permissions to Note schema
2. Add comments collection/schema
3. Update existing endpoints to handle permissions

### Step 2: Sharing & Comments UI
1. Create ShareModal component
2. Create CommentSection component
3. Update NotesView to include sharing and comments

### Step 3: Offline Mode Setup
1. Install WatermelonDB
2. Create database schema
3. Implement sync logic
4. Add offline indicators

### Step 4: Backup & Versioning UI
1. Create BackupModal component
2. Create VersionComparison component
3. Update NotesView with enhanced versioning

## 🎯 Current Focus: Step 1 - Backend Schema Extensions
