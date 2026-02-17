# Sample justfile for testing

# Build the project
build:
    echo "Building project..."
    npm run compile

# Run tests
test:
    echo "Running tests..."
    npm test

# Clean build artifacts
clean:
    echo "Cleaning..."
    rm -rf dist out

# Start development mode
dev:
    echo "Starting dev mode..."
    npm run watch

# Package the extension
package:
    echo "Packaging extension..."
    npm run vscode:prepublish
