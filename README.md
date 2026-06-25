# iOS Version Release
- need to setup local .env file with APPLE_URL, EMAIL_FROM, EMAIL_TO, EMAIL_PASS, PORT AND SMTP
- automated github action runs on cron to check Apple website for the latest iOS verison
- compares with the iOS version saved locally (from last check)
- if the versions are different save version locally
- if the versions are different send notification email
