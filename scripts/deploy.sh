#!/bin/sh
# Build and publish dist/ to the gh-pages branch of the `origin` remote.
# One-time setup: create the GitHub repo, `git remote add origin <url>`, then in
# the repo's Settings > Pages choose "Deploy from a branch" > gh-pages / (root).
set -e

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No 'origin' remote. Add one with: git remote add origin <github-url>" >&2
  exit 1
fi

npm test
npm run build
# --nojekyll stops GitHub Pages from ignoring files that start with an underscore.
npx gh-pages --dist dist --nojekyll --message "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
