Here are the clean ways to resolve those React peer-dependency warnings from @keystonehq/sdk:
Quick unblock (no code changes)

npm install with legacy peer deps:
    npm install --legacy-peer-deps

Or force:
    npm install --force

Proper fix via npm overrides (recommended)
Add to your package.json (top-level):

    {
      "overrides": {
        "qrcode.react": "^3.1.0",
        "react-qr-reader": "3.0.0-rc.3"
      }
    }
Then reinstall:

    rm -rf node_modules package-lock.json
    npm install

Note: If @keystonehq/sdk relies on older APIs, this may require testing. If anything breaks, revert and use the “Quick unblock” approach.
Evaluate necessity
If you don’t use Keystone QR features, remove the SDK to eliminate the warnings:

    npm uninstall @keystonehq/sdk

Then search/remove any imports before building.
Prefer pnpm (optional, cleaner dedupe)
pnpm handles peer deps more gracefully:

    pnpm install

Tell me which option you want, and I’ll apply it (add overrides, switch install flags, or remove the SDK).
For the code present, we get this error:
```
Property expected
```
How can I resolve this? If you propose a fix, please make it concise.

Your package.json is malformed at the top. Remove the extra “{” and add a comma after the overrides block.
Replace the top of package.json with:

{
  "name": "gossiperai",
  "version": "0.1.0",
  "private": true,
  "overrides": {
    "qrcode.react": "^3.1.0",
    "react-qr-reader": "3.0.0-rc.3"
  },
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start"
  },
  ...
}
Then reinstall:

rm -rf node_modules package-lock.json
npm install

The error is because react-qr-reader@3.0.0-rc.3 doesn’t exist on npm.
Fix your overrides to remove that line (or use a published version like 3.0.0).
Do this:

{
  "name": "gossiperai",
  "version": "0.1.0",
  "private": true,
  "overrides": {
    "qrcode.react": "^3.1.0"
  },
  ...
}
Then clean install:

rm -rf node_modules package-lock.json
npm install
# if peer warnings block install:
npm install --legacy-peer-deps

//npm install --legacy-peer-deps helps remove all the warnings and issues
