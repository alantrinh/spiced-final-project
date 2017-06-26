For my final project at Spiced Academy I decided to clone a scaled down version of Strava (a social sports app, particularly popular with cyclists) using React.  The functionalities I implemented in this week were user registration/login, uploading of cycling activities, and the basic social aspects of the app (search for other athletes, view other profiles, make and accept follow requests, comment and like (give kudos) activities and an activity feed of followed users or own activities only).

To create the login and register functionalities I created an athletes (users) table using Postgres, hashing passwords and authenticating users with bcrypt and sessions handled by cookie-session.

In order to facilitate the upload of activities (which are in .fit format), I imported the EasyFit node module into my router which parsed the file into a JSON format which I then inserted into my database.

The remaining social functionalities (search, athlete follow requests, activity comments, kudos) involved searching the database and updating when required.