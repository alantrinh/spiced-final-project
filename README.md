
# Stravita

## Overview
For my final project at Spiced Academy I decided to clone a scaled down version of Strava (a social sports app, particularly popular with cyclists) using React.  The functionalities I implemented in this week were user registration/login, uploading of cycling activities, and the basic social aspects of the app (search for other athletes, view other profiles, make and accept follow requests, comment and give kudos to (like) activities and an activity feed of followed users or own activities only).

## Details
To create the login and register functionalities I created an athletes (users) table using Postgres, hashing passwords and authenticating users with bcrypt and sessions handled by cookie-session.

### Login
![Alt text](/public/images/screenshots/login.jpg?raw=true "Login")

In order to facilitate the upload of activities (which are in .fit format), I imported the EasyFit node module into my router which parsed the file into a JSON format which I then inserted into my database and queried to produce my activity summaries.

### Activity
![Alt text](/public/images/screenshots/activity.jpg?raw=true "Activity")

The remaining social functionalities (profile, activity feed, athlete search, athlete follow requests, activity comments and kudos) involved searching the database and updating when required.

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
