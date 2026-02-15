# 🏷️ GIT TAG PROCESS — v1.0.0

**Purpose**: Tag the production release for rollback certainty and version control

---

## 📌 TAGGING COMMAND

From the repository root, run:

```bash
# Annotated tag (recommended - includes metadata)
git tag -a v1.0.0 -m "SkaiScraper v1.0.0 – Production Launch"

# Push tag to remote
git push origin v1.0.0
```

---

## ✅ VERIFICATION

After pushing, verify on GitHub:

```
https://github.com/Damienwillingham-star/Skaiscraper/releases
```

You should see **v1.0.0** tag created.

---

## 📝 TAG METADATA

**Version**: v1.0.0  
**Commit**: `4132bce7`  
**Date**: December 20, 2025  
**Message**: "SkaiScraper v1.0.0 – Production Launch"

---

## 🔄 ROLLBACK USING TAG

If you need to rollback to this exact state:

```bash
# Checkout the tag
git checkout v1.0.0

# Create a new branch from the tag (optional)
git checkout -b rollback-to-v1.0.0

# OR force main back to this tag (DANGEROUS - use with caution)
git reset --hard v1.0.0
git push origin main --force
```

---

## 📊 FUTURE VERSIONS

**Semantic Versioning** (recommended):

- **v1.0.1** - Patch (bug fixes, no new features)
- **v1.1.0** - Minor (new features, backward compatible)
- **v2.0.0** - Major (breaking changes)

---

**Status**: ✅ Ready to tag  
**Next Step**: Run the tagging commands above
