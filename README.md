<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

# Ariza Manager – Backend API (NestJS)

Ariza Manager is a NestJS + MongoDB + AWS S3 backend MVP to manage user-submitted Applications and organizational Inventory. It includes JWT-based authentication and optional Telegram notifications for Application events.

## Quick Start

- **Install dependencies**
  ```bash
  npm install
  ```

- **Environment variables**
  Create `.env` from `.env.example` and fill values:
  ```ini
  MONGO_URI=mongodb://localhost:27017/ariza-db   # or Atlas URI
  PORT=3000

  JWT_SECRET=your_jwt_secret

  AWS_S3_ACCESS_KEY_ID=...
  AWS_S3_SECRET_ACCESS_KEY=...
  AWS_S3_REGION=us-east-1
  AWS_S3_BUCKET_NAME=application-bucketjon

  # Telegram is optional; leave TELEGRAM_CHAT_ID empty to disable notifications
  TELEGRAM_BOT_TOKEN=...
  TELEGRAM_CHAT_ID=            
  ```

- **Run the app**
  ```bash
  npm run start:dev
  ```

- **Swagger**: http://localhost:3000/api/docs

All API routes are available under the global prefix `/api`.

## Tech Overview

- NestJS (TypeScript), Mongoose (MongoDB)
- Auth: JWT (`@nestjs/jwt`, `passport-jwt`)
- Uploads: AWS S3 (`@aws-sdk/client-s3`, `multer-s3`)
- Validation: `class-validator`, `class-transformer` with global implicit conversion
- Swagger: `@nestjs/swagger`
- Telegram: `telegraf` (only for Application notifications; optional)

## Data Model

- `User` (`src/users/schemas/user.schema.ts`)
  - `id` (UUID), `tableNumber` (unique), `fullName`, `branch` (ref), `department` (ref)
  - `inventoryHistory`: array of `{ inventory: ref Inventory, action: "assigned"|"updated", timestamp }`
- `Branch` (`src/branches/schemas/branch.schema.ts`)
  - `id`, `name`
- `Department` (`src/departments/schemas/department.schema.ts`)
  - `id`, `name`, `branch` (ref)
- `Application` (`src/applications/schemas/application.schema.ts`)
  - `id`, `index` ("00001-YYYY"), `status`, `user` (ref), `branch` (ref), `department` (ref),
    `room`, `issue`, `issueComment?`, `images: string[]` (S3 URLs), `additionalComment?`, timestamps
  - Telegram message on create/status change if `TELEGRAM_CHAT_ID` is set
- `Inventory` (`src/inventory/schemas/inventory.schema.ts`)
  - `id`, `serial` (number), `inventoryNumber` (unique), `images: string[]` (S3 URLs),
    `user` (ref), `branch` (ref), `department` (ref), timestamps
  - On create: log `assigned` in user history; on update (user change): log `updated`

## Authentication

- Login by tableNumber
  - `POST /api/auth/login`
  - Body:
    ```json
    { "tableNumber": 123 }
    ```
  - Response:
    ```json
    { "access_token": "<JWT>" }
    ```
  - Use `Authorization: Bearer <JWT>` for protected endpoints.

## Endpoints

All endpoints below assume the prefix `/api`.

### Branches
- **POST** `/branches`
  ```json
  { "name": "HQ" }
  ```
- **GET** `/branches`

### Departments
- **POST** `/departments`
  ```json
  { "name": "IT", "branch": "<branchId>" }
  ```
- **GET** `/departments`

### Users
- **POST** `/users` (no auth for MVP)
  ```json
  {
    "tableNumber": 123,
    "fullName": "John Doe",
    "branch": "<branchId>",
    "department": "<departmentId>"
  }
  ```
- **GET** `/users` (JWT)

### Applications (JWT)
- **POST** `/applications` (multipart)
  - Fields (text): `user`, `branch`, `department`, `room`, `issue`, `issueComment?`, `additionalComment?`
  - Files: `images` (repeatable file key)
  - Behavior: uploads to S3, generates `index`, saves; sends Telegram if `TELEGRAM_CHAT_ID` set
- **GET** `/applications` (optional `?user=<userId>`)
- **PATCH** `/applications/:id/status`
  ```json
  { "status": "accepted" }
  ```
  Allowed: `new|accepted|processed|rejected|completed`

### Inventory (JWT)
- **POST** `/inventory` (multipart)
  - Fields (text): `serial` (number), `inventoryNumber` (string), `user`, `branch`, `department`
  - Files: `images` (repeatable file key)
  - Behavior: uploads to S3, saves; logs `assigned` in `User.inventoryHistory`
- **GET** `/inventory` – list all (populated)
- **GET** `/inventory/:id` – get one (populated)
- **PATCH** `/inventory/:id` (multipart)
  - Optional fields: `serial`, `inventoryNumber`, `user`, `branch`, `department`
  - Optional files: `images` (replaces if provided)
  - Logs `updated` in user history if `user` changes

## Using Postman

1. Create Branch → `POST /api/branches` → get `branchId`
2. Create Department → `POST /api/departments` with `branchId` → get `departmentId`
3. Create User → `POST /api/users` → get `userId`
4. Login → `POST /api/auth/login` with `{ tableNumber }` → get JWT
5. Create Application → `POST /api/applications` (multipart with `images`)
6. Update Application Status → `PATCH /api/applications/:id/status`
7. Create Inventory → `POST /api/inventory` (multipart)
8. List Inventory → `GET /api/inventory`

Tips for multipart:
- Use key `images` for each file row.
- Text numeric fields (e.g., `serial`) are strings in multipart; the app converts them to numbers.

## S3 Public Access

- Code does not send object ACLs. To make images public:
  - Disable "Block all public access" on the bucket (if desired)
  - Add a bucket policy allowing `s3:GetObject` on `arn:aws:s3:::<bucket>/*`
- Otherwise, keep private and use presigned URLs (not implemented by default).

## Files to Know

- App bootstrap/Swagger: `src/main.ts`
- Mongo config: `src/app.module.ts`
- Telegram (Applications only): `src/telegram/telegram.service.ts`
- Applications: `src/applications/*`
- Inventory: `src/inventory/*`
- Users (history): `src/users/schemas/user.schema.ts`

---

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
