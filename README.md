
# Stravita

## Overview
For my final week project at Spiced Academy I decided to clone a scaled down version of Strava (a social sports app, particularly popular with cyclists) using React.js.  The functionalities I implemented in this week were user registration/login, uploading of cycling activities, and the basic social aspects of the app (search for other athletes, view other profiles, make and accept follow requests, comment and give kudos to (like) activities and an activity feed of followed users or own activities only).

## Details
To create the login and register functionalities I created an athletes (users) table using PostgreSQL, hashing passwords and authenticating users with bcrypt and sessions handled by cookie-session with csrf provided through a special instance of the axios module found in the 'src' folder.

### Login
![Alt text](/public/images/screenshots/login.jpg?raw=true "Login")

In order to facilitate the upload of activities (which are in .fit format), I imported the EasyFit Node.js module into my router which parsed the file into a JSON format which I then inserted into my database and queried to produce my activity summaries.

### Activity
![Alt text](/public/images/screenshots/activity.jpg?raw=true "Activity")

Uploading of profile pictures were done via Multer middleware. The remaining social functionalities (profiles, activity feed, athlete search, athlete follow requests, activity comments and kudos) involved searching the database and updating when required.

### Personal Profile
![Alt text](/public/images/screenshots/profile.jpg?raw=true "Personal Profile")

### Activity Feed
![Alt text](/public/images/screenshots/activity_feed.jpg?raw=true "Activity Feed")

### Athlete Search
![Alt text](/public/images/screenshots/athlete_search.jpg?raw=true "Athlete Search")

### Athlete Profile
![Alt text](/public/images/screenshots/athlete.jpg?raw=true "Athlete Profile")

### Followers
![Alt text](/public/images/screenshots/followers.jpg?raw=true "Followers")
