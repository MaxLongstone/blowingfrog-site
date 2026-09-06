#!/bin/bash
# Usage: ./publish.sh "path/to/image.jpg"
# Run from /Users/luis/blowingfrog
# The script stages everything and pushes → Netlify auto-deploys

set -e

IMAGE=$1

if [ -n "$IMAGE" ]; then
  DEST="assets/blog-images/$(basename "$IMAGE")"
  cp "$IMAGE" "$DEST"
  echo "✓ Image copied to $DEST"
fi

git add -A
git commit -m "Publish new blog post — $(date '+%Y-%m-%d %H:%M')"
git push

echo ""
echo "✓ Pushed — Netlify will deploy in ~30 seconds"
echo "  blowingfrog.com/blog"
