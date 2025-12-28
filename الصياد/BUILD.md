Build and CI for Windows EXE

There is a GitHub Actions workflow at `.github/workflows/electron-build-windows.yml` that builds the project on `windows-latest` and uploads the `.exe` as an artifact.

Usage:
- Push to `main` or run the workflow manually from the Actions tab.
- The workflow runs in the `الصياد` subdirectory, installs deps, runs `npm run build`, then `npm run build:electron`, and uploads the `dist/` folder.

Notes:
- If you want signed installers, add the signing certificate(s) as repository secrets and ask me to help configure `electron-builder` to sign the artifacts.
- To build locally on Linux: install `wine` and `mono` and run `npm run build:electron` (not recommended; GitHub Actions on Windows is easier).