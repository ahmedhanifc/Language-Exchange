# Language-Exchange
- HafsaFarhan127 is the GitHub account for student id: 60106652 with the email:60106652@udst.edu.qa.
The account is linked to the university email id through GitHub Education.

- ahmedhanifc - StudentId: 60301085 - 60301085@udst.edu.qa

# Dependencies
- Express
- cookie-parser
- express-handlebars
- body-parser
- mongo-db
-crypto 
   This is for getting the UUID
## Note
Make sure to npm install once you pull the program

CSRF tokens need to be added whereever there is a text box and <script> tag can be passed through

##Business Rules
-BUSINESS RULE:When userA adds userB as friend,in userB's contacts list-userA gets added as well

-BUSINESS RULE: USERS MUST UPLOAD PROFILE PICTURES,THERE WILL BE NO DEFAULT FOR THEM.we want personlized profiles and visible ones.

-BUSINESS RULE:user cant even login wihtout verification and once they have been verified,the rest of the site does not need to check for it.

-BUSINESS RULE: We update a session with filled values  only after login not during sign-up

# Language Exchange Platform

## Overview
The **Language Exchange Platform** is designed to connect individuals who wish to learn new languages with native speakers around the world. By fostering real-time text-based communication, users can improve their language skills interactively and immerse themselves in cultural exchanges. 

This project is built with **Node.js**, **Express.js**, and **MongoDB**

## Features

### 1. **User Registration and Profile Setup**
- Users can:
  - Register with a username, email, and password.
  - Set up profiles including their name, profile picture, and personal details.
  - Indicate languages they are fluent in and languages they wish to learn.
- Password reset and email verification are supported.

### 2. **Language Learning and Contact Management**
- Users can:
  - View and add other users fluent in their desired language.
  - Manage a contact list of friends.
  - Block or unblock users.

### 3. **Messaging**
- Text-based messaging allows users to communicate with their contacts.
- Messages update on page refresh (real-time functionality is not implemented).

### 4. **Badges**
- Badge system to reward user achievements:
  - **First Conversation**: Message sent and replied to.
  - **100 Messages Sent**: Achieved when sending 100 messages.
  - More can be added as needed

### 5. **Security**
- Protection against Cross-Site Request Forgery (CSRF).
- User sessions are managed securely with cookies.

## Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB**
- **CoreUI Template** for consistent frontend design

## Development Notes
- **Flash Messages**: Used extensively for success and error notifications.
- **Session Management**: Cookies store session keys; data retrieved and validated per request.
- **CSRF Tokens**: Tokens are generated and verified for sensitive operations.
- **Badge System**: Modular design allows easy addition of new badges.

## Future Enhancements
- Real-time messaging.
- Audio and video communication.
- Advanced user analytics and statistics.
- AI Chatbot

## Contact
For inquiries, please contact:
1)  Ahmed Hanif - ahmedhanifc@gmail.com OR 60301085@udst.edu.qa
2) Hafsa Farhan - hafsafarhan127@gmail.com OR 60106652@udst.edu.qa
