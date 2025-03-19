# Instant Messaging App Backend

This is a backend for an instant messaging application built using the MERN stack by Arden Dougherty for CS-314 at Portland State University. 

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Available Endpoints](#available-endpoints)

## Prerequisites

- Node.js
- npm
- MongoDB

## Installation

1. **Clone** the repository or download the source code.
2. **Navigate** to the project directory in your terminal.
3. **Install** dependencies:

   ```bash
   cd backend
   npm install
   ```

## Usage

**Start the server**:

  ```bash
  cd backend
  npm run dev
  ```

  By default, the server will run at http://localhost:8747.

  Go to the frontend at https://dreamqin68.github.io/frontend-project/.

**Testing**:

  ```bash
  cd backend
  npm test
  ```

## Available Endpoints

### POST `/api/auth/signup`

Accepts user credentials and creates a new user in the database.

#### Request Body

```bash
{
  "email": "string",
  "password": "string"
}
```

### POST `/api/auth/login`

Accepts user credentials and creates a JWT token as a cookie.

#### Request Body

```bash
{
  "email": "string",
  "password": "string"
}
```

### POST `/api/auth/logout`

Clears all cookies.

#### Request Body

No request body required

### GET `/api/auth/userinfo`

Checks if a user is logged in and return the user data

#### Request Body

No request body requried

### POST `/api/auth/update-profile`

Accepts user info and updates the item in the database

#### Request Body

```bash
{
  "firstName": "string",
  "lastName": "string"
}
```

### POST `/api/chatrooms/create/:id`

Creates a chatroom in the database with the logged in user and the user specified in the params.

#### Request Body

No request body required.

### DELETE `/api/chatrooms/delete/:id`

Removes a chatroom from the database with the logged in user and the user specified in the params.

#### Request Body

No request body required.

### GET `/api/chatrooms/list`

Returns a list of all chatrooms that include the logged in user

#### Request Body

No request body required.

### GET `/api/messages/users`

Returns a list of users other than the logged in user

#### Request Body

No request body required.

### POST `/api/messages/send/:id`

Creates a new message in the database, from the logged in user to the user specified in the params.

#### Request Body

No request body required.

### GET `/api/messages/:id`

Returns a list of messages between the logged in user and the user specified in the params.

#### Request Body

No request body required.