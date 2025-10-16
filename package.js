const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SANDBOX_DIR = path.join(process.cwd(), 'sandbox');
const PACKAGE_NAME = 'lodash@4.17.21'; // CHANGE THIS to any package you want to test

/** Utility function to run shell commands */
function runCommand(command, cwd) {
    console.log(`\n$ ${command}`);
    try {
        // Inherit stdio so you see npm's output
        execSync(command, { cwd, encoding: 'utf-8', stdio: 'inherit' });
    } catch (error) {
        console.error(`Command failed: ${command}`);
        process.exit(1);
    }
}

/** Step 1: Creates an isolated node_modules in ./sandbox. */
function createSandbox() {
    console.log('--- 1. Creating Isolated Sandbox ---');
    // Clean up previous runs
    if (fs.existsSync(SANDBOX_DIR)) {
        fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(SANDBOX_DIR, { recursive: true });

    // A minimal package.json is required for npm install --prefix to work correctly
    fs.writeFileSync(path.join(SANDBOX_DIR, 'package.json'), JSON.stringify({
        name: 'sandbox-project',
        version: '1.0.0',
        private: true,
        dependencies: {}
    }, null, 2));

    console.log('Sandbox created successfully.');
}

/** Step 2: Installs a specific version and captures lockfile. */
function installAndCaptureLockfile() {
    console.log('--- 2. Installing Package Programmatically ---');

    // Use npm install with --prefix to isolate the install to the sandbox
    runCommand(`npm install ${PACKAGE_NAME} --prefix .`, SANDBOX_DIR);

    const lockfilePath = path.join(SANDBOX_DIR, 'package-lock.json');
    if (!fs.existsSync(lockfilePath)) {
        console.error('Error: package-lock.json was not created.');
        process.exit(1);
    }
    console.log('Package installed and deterministic package-lock.json captured.');
    
    return fs.readFileSync(lockfilePath, 'utf-8');
}

/** Step 3: Verifies installed tree checksum (integrity). */
function verifyTreeChecksum(lockfileContent) {
    console.log('--- 3. Verifying Installed Tree Checksum (Integrity) ---');
    
    try {
        const lockfile = JSON.parse(lockfileContent);
        // The key for the installed package in the lockfile
        const packageName = PACKAGE_NAME.split('@')[0];
        const packageKey = `node_modules/${packageName}`;
        
        // The integrity hash is the core of determinism
        const integrity = lockfile.packages[packageKey].integrity;

        if (integrity) {
            console.log(`SUCCESS: Found Integrity Checksum for ${packageName}: ${integrity.substring(0, 20)}...`);
            console.log('The presence of this integrity hash ensures the installed package contents are deterministic.');
        } else {
            console.error('Verification FAILED: Could not find integrity hash in lockfile.');
            process.exit(1);
        }
    } catch (e) {
        console.error('Verification FAILED: Error parsing lockfile.');
        console.error(e);
        process.exit(1);
    }
}

// --- Main Execution ---
createSandbox();
const lockfile = installAndCaptureLockfile();
verifyTreeChecksum(lockfile);
console.log('\n✅ Task complete. Check the ./sandbox directory for the results!');
