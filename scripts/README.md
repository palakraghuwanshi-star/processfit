# Admin Scripts

This directory contains scripts for performing administrative actions on your Firebase project.

## `set-admin-claim.js`

This script grants a user administrative privileges by setting a custom claim (`isAdmin: true`) on their Firebase Authentication user record.

### Prerequisites

1.  **Node.js**: You must have Node.js installed on your machine.
2.  **Dependencies**: Run `npm install` from the root of the project to install the necessary `firebase-admin` package.
3.  **Service Account Key**: You need a Firebase service account key.

### Instructions

#### Step 1: Get Your Service Account Key

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2.  Click the gear icon next to **Project Overview** and select **Project settings**.
3.  Go to the **Service accounts** tab.
4.  Click the **Generate new private key** button. A JSON file will be downloaded.
5.  **IMPORTANT:** Rename the downloaded file to `serviceAccountKey.json`.
6.  **IMPORTANT:** Move this `serviceAccountKey.json` file into this `scripts` directory. The `.gitignore` file is already configured to prevent this file from being committed to your repository.

#### Step 2: Run the Script

1.  Make sure you have created the user you want to make an admin in your application first. They must have an account.
2.  Open your terminal and navigate to the root of your project directory.
3.  Run the script using the following command, replacing `<user_email>` with the email address of the user you want to make an admin:

    ```bash
    node scripts/set-admin-claim.js <user_email>
    ```

    For example:
    ```bash
    node scripts/set-admin-claim.js jane.doe@example.com
    ```

4.  The script will print a success message if the claim is set correctly. The user will have admin privileges the next time they log in or their session token is refreshed.
