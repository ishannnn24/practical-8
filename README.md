# Programmatic Package Sandbox Utility

A utility script designed to demonstrate **deterministic and isolated package installation** using the npm CLI.

## Goal

The primary goal is to programmatically install a package into a sandbox folder with a deterministic `package-lock.json`.

## Task Fulfillment

| Goal | Method in `sandbox_install.js` |
| :--- | :--- |
| Creates isolated `node_modules` | Uses `fs` to create `./sandbox` and runs `npm install --prefix .` |
| Installs package & captures lockfile | Uses `child_process.execSync` to run `npm install [package]` |
| Verifies installed tree checksum | Parses `package-lock.json` and confirms the existence of the `integrity` hash. |

## Quick Start

### Prerequisites

* Node.js and npm (npm v7+ is recommended)

### Run the Script

1.  Make sure you have Node.js installed.
2.  Clone this repository or save the file.
3.  Execute the script from the project root:
    ```bash
    node sandbox_install.js
    ```

### Results

The script will create a new `./sandbox` folder containing a dedicated `node_modules` and a fully deterministic `package-lock.json`.
