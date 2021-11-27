# Messenger API

## About 

Little messenger API coded with Express.js and Mongoose.

## Setup 

1. Install dependencies by doing ```npm install``` in the project folder.
2. Import the data file in postman (```Module back end.postman_collection.json```)
3. Run the project by doing ```npm start``` in the project folder.

## Features & routes

* User

  | Description        | Route          | Method | 
  |--------------------|----------------|--------|
  | Create a user      | /api/users     | POST   |
  | Get all users      | /api/users     | GET    |
  | Get user by ID     | /api/users/:id | GET    |
  | Get connected user | /api/users/me  | GET    |

* Discussion

  | Description                      | Route                         | Method | 
  |----------------------------------|-------------------------------|--------|
  | Get all discussions              | /api/discussion               | GET    |
  | Create a new discussion          | /api/discussion/new           | POST   |
  | Get discussion by ID             | /api/discussion/:id           | GET    |
  | Add a user to a discussion       | /api/discussion/:id/add/:user | POST   |
  | Get messages of a discussion     | /api/discussion/:id/messages  | GET    |
  | Mark the last discussion as read | /api/discussion/:id/read      | PUT    |

* Message

  | Description            | Route                 | Method |
  |------------------------|-----------------------|--------|
  | Get all messages       | /api/message          | GET    |
  | Create a new message   | /api/message/new      | POST   |
  | Get message by ID      | /api/message/:id      | GET    |
  | Change message content | /api/message/:id/edit | GET    |

* Auth

  | Description             | Route            | Method |
  |-------------------------|------------------|--------|
  | Login to an account     | /api/auth/login  | POST   |
  | Login out of an account | /api/auth/logout | DEL    |