# Git Commit Crafter 🤖

A powerful AI-powered CLI tool that revolutionizes the `git commit` process by automatically generating professional commit messages based on your staged code changes using the GLM-4 AI model.

## Features

- 🧠 **AI-Powered**: Uses GLM-4 AI to analyze your code changes and generate professional commit messages
- 📝 **Conventional Commits**: Follows the Conventional Commits specification (feat, fix, chore, etc.)
- 🎯 **Interactive Selection**: Presents multiple AI-generated options in an interactive menu
- 🎨 **Beautiful UI**: Features loading spinners and colored terminal output for a premium experience
- 🔒 **Secure**: API keys stored securely in environment variables
- 🚀 **Easy to Use**: Simple command-line interface
- 📊 **Repository Status**: View current branch, modified files, and recent commits
- 🔄 **Sync with Remote**: Pull latest changes and push local updates in one command
- 🧹 **Repository Cleanup**: Remove untracked files and delete merged branches
- 🌿 **Branch Management**: Create, switch, and delete branches with ease
- 🚀 **Release Creation**: Create and push version tags with release notes

## Prerequisites

- Node.js (v14 or higher)
- Git installed and configured
- GLM-4 API key

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Get your GLM-4 API key from https://open.bigmodel.cn/
2. Edit the `.env` file and replace `your_api_key_here` with your actual API key:
   ```
   API_KEY=your_actual_api_key_here
   ```

## Usage

The Git Commit Crafter now supports multiple commands for different GitHub maintenance tasks:

### 1. Generate Commit Messages (Default)

1. Stage your changes using `git add`:
   ```bash
   git add .
   ```
   **Important**: You must stage at least one file before running the tool. The tool only works with staged changes.

2. Run the Git Commit Crafter:
   ```bash
   npm start
   ```
   or
   ```bash
   npm run dev
   ```

3. The tool will:
   - Read your staged changes
   - Send them to the GLM-4 AI for analysis
   - Generate 5 professional commit message options
   - Display them in an interactive menu
   - Wait for you to select your preferred message
   - Commit your changes with the selected message
   - Ask if you want to push the commit to your remote repository (GitHub)

4. After committing, you'll be asked:
   ```
   ? Would you like to push the commit to remote repository (GitHub)? (y/N)
   ```
   - If you select "Yes", the tool will push your commit to the remote repository
   - If you select "No", you can push manually later using `git push`

**Note**: If you see an error about "No staged changes found", it means you haven't staged any files yet. Use `git add` to stage your changes first.

### 2. View Repository Status

Check the current status of your repository, including modified files, current branch, and recent commits:

```bash
npm run status
```

This command will display:
- Modified files with their status (added, modified, deleted, etc.)
- Current branch name
- Recent commit history
- Remote synchronization status

### 3. Sync with Remote Repository

Pull the latest changes from the remote repository and push your local changes in one command:

```bash
npm run sync
```

This command will:
- Check for uncommitted changes and prompt you to commit them first
- Pull latest changes from the remote repository using merge strategy
- Automatically handle divergent branches by configuring merge strategy
- Push your local changes to the remote repository
- Provide detailed instructions if merge conflicts occur

**Note**: If merge conflicts occur, the tool will provide step-by-step instructions to resolve them manually.

### 4. Clean Up Repository

Remove untracked files and delete merged branches to keep your repository clean:

```bash
npm run clean
```

This command will:
- Detect untracked files and ask if you want to remove them
- Find merged branches and ask if you want to delete them
- Provide a summary of cleanup actions performed

### 5. Manage Branches

Create, switch to, or delete branches with an interactive menu:

```bash
npm run branch
```

This command will:
- List all available branches (local and remote)
- Highlight the current branch
- Provide options to:
  - Create a new branch
  - Switch to an existing branch
  - Delete a branch

### 6. Create a Release

Create and push version tags with release notes:

```bash
npm run release
```

This command will:
- Show the latest releases
- Ask for a version number for the new release
- Open an editor for release notes
- Create and push the tag to the remote repository
- Provide a link to view the release on GitHub

### Understanding Local Commits vs Remote Pushes

- **Local Commit**: When you commit changes, they are saved to your local git repository
- **Remote Push**: When you push changes, they are uploaded to your remote repository (like GitHub)
- The tool first creates a local commit, then optionally pushes it to the remote repository
- If you don't push immediately, your commit exists locally but won't be visible on GitHub until you push it

## Example Workflow

```bash
# Make some changes to your code
echo "console.log('Hello, World!');" >> app.js

# Stage the changes
git add app.js

# Run Git Commit Crafter
npm start

# Output:
# 🤖 Git Commit Crafter
# Reading your staged changes...
#
# 🤖 The AI is crafting your commit messages...
# ✔ AI suggestions received!
#
# 💡 Here are your AI-generated commit messages:
#
# ❯ feat: Add hello world console log
#   feat: Add simple console output
#   chore: Add debug console statement
#   feat: Implement basic logging functionality
#   fix: Add missing console output
#
# 📝 Committing your changes...
#
# ✔ Commit successful!
# Committed with: "feat: Add hello world console log"
```

## How It Works

1. **Reading Changes**: The tool uses `git diff --staged` to read all staged changes
2. **AI Analysis**: Changes are sent to the GLM-4 AI with a carefully crafted prompt
3. **Message Generation**: The AI generates 5 commit messages following Conventional Commits format
4. **Interactive Selection**: Users can navigate and select their preferred message using arrow keys
5. **Automatic Commit**: The selected message is used to commit the changes

## Error Handling

The tool includes comprehensive error handling for:
- No staged changes
- Missing API key configuration
- API communication failures
- Git command failures

## Dependencies

- `execa`: For executing git commands
- `axios`: For communicating with the GLM-4 API
- `inquirer`: For creating interactive CLI menus
- `ora`: For displaying loading spinners
- `chalk`: For adding colors to terminal output
- `dotenv`: For managing environment variables

## Contributing


just checking if the sync is working or not

Feel free to submit issues and enhancement requests!

## License

MIT License - see LICENSE file for details
