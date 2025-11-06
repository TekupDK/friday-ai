# Repository Migration Plan: tekup-ai-v2 → friday-ai

## 📋 Overview

Migrate `tekup-ai-v2` from being part of the monolithic `TekupDK/tekup` repository to a standalone dedicated repository `TekupDK/friday-ai`.

## 🎯 Goals

1. Create clean, independent repository for Friday AI
2. Eliminate submodule complexity
3. Enable direct deployment from dedicated repo
4. Maintain full git history
5. Update all references and documentation

## 📊 Current State

### Repository Structure
- **Current Remote**: `https://github.com/TekupDK/tekup.git`
- **Current Branch**: `main`
- **Latest Commit**: `0a94ec9` - "feat: Complete Friday AI branding & single-model architecture"
- **Local Path**: `c:\Users\empir\Tekup\services\tekup-ai-v2`

### Issues with Current Setup
- ❌ Part of monolithic repo with mixed concerns
- ❌ Submodule confusion (Claude's branch trying to add `services/` structure)
- ❌ Deployment complexity
- ❌ Unclear ownership and boundaries

## 🚀 Migration Steps

### Phase 1: Pre-Migration Checks ✅

- [ ] Verify current state is clean (no uncommitted changes)
- [ ] Document current remote configuration
- [ ] List all branches to migrate
- [ ] Check deployment configurations (Railway, Vercel, etc.)
- [ ] Backup current state

### Phase 2: Create New Repository 🆕

- [ ] Create new repo: `TekupDK/friday-ai`
- [ ] Description: "Friday AI - Intelligent Email Management System"
- [ ] Set as public/private (based on preference)
- [ ] Initialize with:
  - ✅ README from current repo
  - ✅ License (if applicable)
  - ❌ No default .gitignore (we have our own)

### Phase 3: Local Repository Update 🔄

- [ ] Add new remote as 'new-origin'
- [ ] Push all branches to new repository
- [ ] Verify all commits transferred
- [ ] Update remote from 'new-origin' to 'origin'
- [ ] Remove old remote

### Phase 4: Update References 📝

- [ ] Update package.json repository field
- [ ] Update README.md with new repo links
- [ ] Update CONTRIBUTING.md (if exists)
- [ ] Update deployment configs (Railway, Vercel)
- [ ] Update any GitHub Actions workflows
- [ ] Update documentation links

### Phase 5: Deployment Updates ☁️

- [ ] Update Railway project to point to new repo
- [ ] Update Vercel project to point to new repo
- [ ] Test auto-deployment from new repo
- [ ] Verify webhooks are configured

### Phase 6: Cleanup 🧹

- [ ] Archive or update old repo references
- [ ] Update local workspace structure
- [ ] Notify team members of new repo
- [ ] Update any external integrations

### Phase 7: Verification ✓

- [ ] Clone fresh from new repo to verify
- [ ] Check all branches are present
- [ ] Verify deployment works
- [ ] Test CI/CD pipeline
- [ ] Confirm git history is intact

## 📦 Commands to Execute

### Step 1: Verify Clean State
```powershell
git status
git log --oneline -5
git remote -v
```

### Step 2: Create New GitHub Repo
```powershell
# Using GitHub CLI
gh repo create TekupDK/friday-ai --public --description "Friday AI - Intelligent Email Management System"
```

### Step 3: Add New Remote and Push
```powershell
# Add new remote
git remote add new-origin https://github.com/TekupDK/friday-ai.git

# Push all branches
git push new-origin --all

# Push all tags
git push new-origin --tags

# Verify
git remote -v
```

### Step 4: Update Origin
```powershell
# Remove old origin
git remote remove origin

# Rename new-origin to origin
git remote rename new-origin origin

# Set upstream for main branch
git branch --set-upstream-to=origin/main main

# Verify
git remote -v
git branch -vv
```

### Step 5: Update package.json
```powershell
# Will be done programmatically in Phase 4
```

## 🔍 Verification Checklist

### Repository Structure
- [ ] All branches migrated (main, any feature branches)
- [ ] All tags migrated
- [ ] Full git history preserved
- [ ] Remote points to new repository

### Code References
- [ ] package.json repository field updated
- [ ] README.md links updated
- [ ] Documentation references updated
- [ ] No hardcoded references to old repo

### Deployment
- [ ] Railway pointing to new repo
- [ ] Vercel pointing to new repo
- [ ] Environment variables configured
- [ ] Auto-deploy working

### Team Communication
- [ ] Team notified of new repo
- [ ] Old repo marked as deprecated/archived
- [ ] Documentation updated across all platforms

## 🚨 Rollback Plan

If issues arise:

1. **Immediate Rollback**:
   ```powershell
   git remote remove origin
   git remote add origin https://github.com/TekupDK/tekup.git
   git fetch origin
   git branch --set-upstream-to=origin/main main
   ```

2. **Deployment Rollback**:
   - Revert deployment configurations to old repo
   - Trigger manual deployment if needed

3. **Communication**:
   - Notify team of rollback
   - Document issues encountered
   - Plan retry with fixes

## 📅 Timeline

- **Duration**: ~30 minutes
- **Downtime**: Minimal (only during deployment config update)
- **Best Time**: During low-traffic period

## 🎉 Success Criteria

- ✅ New repository created and accessible
- ✅ All commits and history preserved
- ✅ Deployments working from new repo
- ✅ Team can clone and work from new repo
- ✅ CI/CD pipeline functional
- ✅ No broken links or references

## 📚 Post-Migration Tasks

- [ ] Update internal documentation
- [ ] Update project management tools
- [ ] Archive old monorepo references
- [ ] Celebrate successful migration! 🎊

## 🔗 Related Resources

- New Repository: `https://github.com/TekupDK/friday-ai`
- Old Repository: `https://github.com/TekupDK/tekup`
- Deployment Dashboard: [Railway/Vercel Links]

---

**Status**: 🟡 Ready to Execute
**Owner**: @empir
**Created**: 2025-11-06
**Last Updated**: 2025-11-06
