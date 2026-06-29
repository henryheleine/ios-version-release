# ios-beta-notification-service

A basic repo that checks a public Apple website and sends a notification if a new beta is released

### Usage

This microservice is intended to be run on periodically (via GitHub Actions).

### Project Structure

```
ios-beta-notification-service/
├── index.js                              # main node file that runs website check and save/email if required
├── package.json                          # Deps
├── .env.example                          # Environment variables example
├── state.json                            # json to store last check e.g. { "ios": "27 Beta 2" }
└── README.md                             # This file
```

### Support

For questions or issues:
- Open a GitHub issue or PR/comment
