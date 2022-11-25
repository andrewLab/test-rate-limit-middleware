# Rate limiter test task

## Goals
- [X] Implement a basic auth middleware. It could be just an uuid token passed in headers, or it could be a jwt. No need to implement login/register routes. You can just store the token somewhere (env, app, db).
- [X] Implement 2 types of routes: public and private. Private routes should use the auth middleware.
- [x] Implement a rate limiter. It should check a token limit for private routes and a ip limit for public routes.
- [x] Set a rate limit by token to 200 req/hour
- [x] Set a rate limit by ip to 100 req/hour 
- [x] Those numbers (token limit and ip limit) should be configurable from the environment
- [x] When a user reaches the limit, in the response show an error message about current limit for that user account, and display when (time) the user can make the next request
- [x] Keep concurrency in mind.
Your solution should handle multiple requests at the same time,
for example, let's say you have 4000 requests per second to public route from the same user, so your solution should respond with 429 status code when the rate limit is reached.
- [x] Bonus: keep performance in mind.
- [x] Optional task: Create a different weight of request rate for every URL: 1/2/5 points per request (you can assume we have 5 different end points) depending on end point.

Allowed stack includes:
- Node.js using Express or Nest.js.
- MongoDB
- Redis

Feel free to use additional services, except ready limiter libraries.

## Implementation
### Disclamer:
> I strongly believe that application request throttling falls under load balancing responsibility of a dedicated network infrastracture services (AWS ELB, NGINX as LB, F5). The implementation on application level will refer to algorythms used by the services

### Assumptions
- Given the rate limit window measured in hours, the goal of rate limiting is to hard limit user access to application rather that smother and distribute traffic (as traffic distribution strategies are usually applied within shorter timespan - minutes, seconds, ms) to control for traffic burst. Thus, no traffic distribution strategies will be applied and a user will be hard limited up until the limit period expires

### Solution
Given the conditions above, the proposed approach is "Token Bucket" strategy as most efficient in terms of persistence efficiency and computational complexity.
Also, for handling request bursts(concurrency), incoming traffic is sequentialized. 


## Installation

1) Setup and configure .env file. If npm is available, for default values can run
    ```
    npm run copy-env
    ```
2) (Optionally) Configure APP_AUTH_TOKEN (default:"secret")
3) Run the app with Docker
    ```
    docker compose up -d
    ```

The app should be available under http://localhost:3000 (or the APP_PORT specified)

## Testing

For testing purposes, `http://localhost:3000/reset` endpoint is available for rate limit reset 


For automatic load testing, [Artillery](https://github.com/artilleryio/artillery) is used. Default scenario is located in `tests/load/bursts.yml`.
It is configured for 4000 users/second for 5 seconds.
Successful request threshold hardcoded is based on assumption max of `100` public and `200` private.
The test can be run with
```
docker compose exec -it app npm run test:load
```
**The test will reset rate limits before run**