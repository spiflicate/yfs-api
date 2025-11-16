# GitHub Actions CI/CD Workflow

This document explains the Continuous Integration/Continuous Deployment (CI/CD) workflow set up for this project.

## What is CI/CD?

**Continuous Integration (CI)** automatically builds and tests your code every time changes are pushed to ensure nothing breaks.

**Continuous Deployment (CD)** automates the release process (we'll add this in the future if needed).

## When Does the Workflow Run?

The CI workflow runs automatically in these situations:

1. **On Push to Main** - When you push commits directly to the main branch
2. **On Pull Requests** - When someone opens or updates a PR targeting main
3. **Manual Trigger** - You can manually run it from the GitHub Actions tab

## What Does the Workflow Do?

The workflow runs **6 separate jobs** that check different aspects of the code:

### Job 1: Lint & Format Check ✨
**Purpose:** Ensures code follows consistent style and quality rules

**Steps:**
- Checks out your code
- Installs Bun and dependencies
- Runs `bun run lint` (Biome linting)
- Checks code formatting with Biome

**Why?** Catches style issues, potential bugs, and ensures consistent code formatting.

---

### Job 2: TypeScript Type Check 🔍
**Purpose:** Verifies all TypeScript types are correct

**Steps:**
- Checks out your code
- Installs Bun and dependencies
- Runs `bun run type-check`

**Why?** Catches type errors that could cause runtime bugs. We want 0 TypeScript errors!

---

### Job 3: Test (Multiple Node.js Versions) 🧪
**Purpose:** Runs all unit tests across different Node.js versions

**Steps:**
- Tests on Node.js 18, 20, and 22 (in parallel)
- Runs `bun test tests/unit`
- Generates coverage report

**Why?** Ensures the package works on all supported Node.js versions and all tests pass.

---

### Job 4: Build Package 📦
**Purpose:** Builds the production package and verifies output

**Steps:**
- Cleans previous builds (`bun run clean`)
- Builds TypeScript to JavaScript (`bun run build`)
- Verifies dist/ directory contains required files
- Uploads build artifacts for later jobs

**Why?** Ensures the package can be built successfully and all output files are generated.

---

### Job 5: Installation Test 📥
**Purpose:** Simulates installing the package like a real user would

**Steps:**
- Downloads the built package from Job 4
- Creates a test npm package (`.tgz` file)
- Creates a fresh test project
- Installs the package in the test project
- Tries to import and use the package

**Why?** Catches issues that only appear when the package is installed (import errors, missing files, etc.)

---

### Job 6: All Checks Passed ✅
**Purpose:** Final verification that everything succeeded

**Steps:**
- Checks if all previous jobs passed
- Fails if any job failed
- Shows success message if all passed

**Why?** Provides a single "gate" that must be green for the PR to be merged.

---

## What Happens If Something Fails?

1. **The workflow stops** and marks the check as failed
2. **You get a notification** (if you have GitHub notifications enabled)
3. **The PR shows a red X** indicating checks failed
4. **You can click on the failed job** to see detailed logs
5. **Fix the issue** and push again - the workflow runs automatically

## Benefits of This CI/CD Setup

✅ **Catches bugs early** - Before they reach production  
✅ **Prevents regressions** - Ensures new code doesn't break existing features  
✅ **Consistent quality** - All code must pass the same checks  
✅ **Multi-version testing** - Works on Node.js 18, 20, and 22  
✅ **Automated** - No manual work needed  
✅ **Fast feedback** - Know within minutes if something is broken  
✅ **Build verification** - Ensures the package can be built and installed  

## Workflow Performance

Expected run time: **~5-7 minutes** total

Jobs run in parallel when possible:
- Jobs 1, 2, 3, 4 run simultaneously
- Job 5 waits for Job 4 (needs build artifacts)
- Job 6 waits for all others (final check)

## Cost

**Free!** GitHub Actions provides free minutes for public repositories.

## Future Enhancements

We could add:
- **Code coverage reports** - Upload to Codecov or Coveralls
- **Integration tests** - Run real API tests (would need secrets)
- **Automated releases** - Publish to npm on version tags
- **Dependency updates** - Auto-PRs for dependency updates (Dependabot)
- **Security scanning** - Check for vulnerabilities

## How to Use

### Viewing Workflow Runs

1. Go to your GitHub repository
2. Click the "Actions" tab
3. See all workflow runs and their status

### Running Manually

1. Go to Actions tab
2. Click "CI" workflow
3. Click "Run workflow" button
4. Select branch and click "Run workflow"

### Protecting Main Branch

After testing the workflow, you can:
1. Go to Settings → Branches
2. Add branch protection rule for `main`
3. Require "All Checks Passed" before merging
4. Now PRs can't be merged unless CI passes!

## Files Added

- `.github/workflows/ci.yml` - The workflow configuration

That's it! The workflow is completely self-contained.

---

## Questions?

If the workflow fails or you need help understanding the logs, check:
1. The specific job that failed
2. The error message in the logs
3. The step that failed within that job

Most common failures:
- Linting errors - Run `bun run lint:fix` locally
- Type errors - Run `bun run type-check` locally
- Test failures - Run `bun test` locally
- Build errors - Run `bun run build` locally
