# Universal Wishlist Development
## Purpose
This repository contains our development work for extending the existing Universal Wishlist application. For this project,
we are adding API-related functionality to the original Wishlist application that we forked. These API additions are intended to support our wishlist extension,
which is being developed in a separate repository.

## Accessing the Project
### Cloning the Repository
```sh
git clone https://github.com/UniversalWishList/wishlist.git
```

### Accessing the Project Directory

```sh
cd wishlist
```
### Checking Out the Submission Branch
```sh
git checkout initial_results
```
- This branch contains our latest changes and build history required for this submission.

## Continuous Integration: Viewing Workflows with GitHub Actions

<img src="./assets/github-actions.png" width="40%" />

- The __Actions__ tab shows both failing and passing builds from previous push commits made to the __initial_results__ branch.
- For future development, we intend for these workflows to run solely on the __main__ branch.
- Workflows that automate unit testing appear under the __Build and Test__ workflow.
- Workflows that generate Docker images from push commits appear under the __Build and Push Docker__ Image workflow.

## Building the Wishlist Application
### Prerequisites
- Before you begin, ensure the following is installed and properly configured:
    - __Docker__ (Docker Engine + Docker Compose)
- You can verify installation with:
```sh
docker --version
docker compose version
```

### Starting the Application
- You can run the following commands to start the Wishlist application (from the project directory):
```sh
docker compose up -d
```
 __OR__ (depending on system permissions):
 ```sh
sudo docker compose up -d
```

### Accessing the application
- Once the container is running, open your browser and go to:
```sh
http://localhost:3280/
```
- You should now see the existing Wishlist application interface that we forked from.

### Wishlist Application Running in Browser:

<img src="./assets/wishlist-application.png" width="50%" />


## Running the Unit Tests
### Prerequisites
- __node v24.x__
    - Ensure nodejs is installed first
    - If running Ubuntu you can install with:
        - sudo apt install nodejs
    - You can also install __nvm__ which is a node version manager that can be used to install this specific version of node.
    - If installing nvm you can use the following:
        - curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    - This version  of node can be installed with nvm by using the following command:
        - nvm install 24
- [pnpm](https://pnpm.io/installation) v10.x

### <ins> Initial Setup for Running Unit Tests:
### Install dependencies

```sh
pnpm install
```
- This command may take a while to run the first time.
### Generate SvelteKit files
```sh
pnpm svelte-kit sync
```
- This is required for syncing the project before running the unit tests to resolve SvelteKit types.
### Running the __Jest__ (JavaScript) unit tests
```sh
pnpm test:unit
```
- This executes the JavaScript/TypeScript unit tests using Jest.
### Output of Unit Tests Passing:

<img src="./assets/unit-tests.png" width="40%" />


## Where to Find Unit Tests?
### Tests Location: tests/apikeygen/

- The project includes five unit tests covering function behavior, string creation, string length, randomness, and whether generated characters are valid hexadecimal values.
- These tests validate the API key generation logic.

## keygen.tests.ts
<img src="./assets/keygen-tests.png" width="50%" />