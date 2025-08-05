Push your local changes to the master branch first, then mirror them to the main branch.

Follow these steps:

1. Commit all local changes with a clear message
2. Push to master: git push origin master
3. Push to main: git push origin master:main
4. Verify both branches are in sync
5. Ensure all checks (tests, linting, CI/CD) pass on both branches