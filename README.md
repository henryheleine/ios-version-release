# iOS Version Release
- need to setup local .env file with APPLE_URL, EMAIL_FROM, EMAIL_TO, EMAIL_PASS, PORT AND SMTP
- chron job checks the Apple website for the latest iOS verison
- compare to the version saved locally (from last check)
- if the versions are different save version locally
- if the versions are different send notification email
