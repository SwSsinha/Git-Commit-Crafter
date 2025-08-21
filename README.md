# Git Commit Crafter 🤖

A powerful AI-powered CLI tool that revolutionizes the `git commit` process by automatically generating professional commit messages based on your staged code changes using the GLM-4.5 AI model.

## Features

- 🧠 **AI-Powered**: Uses GLM-4.5 AI to analyze your code changes and generate professional commit messages
- 📝 **Conventional Commits**: Follows the Conventional Commits specification (feat, fix, chore, etc.)
- 🎯 **Interactive Selection**: Presents multiple AI-generated options in an interactive menu
- 🎨 **Beautiful UI**: Features loading spinners and colored terminal output for a premium experience
- 🔒 **Secure**: API keys stored securely in environment variables
- 🚀 **Easy to Use**: Simple command-line interface

## Prerequisites

- Node.js (v14 or higher)
- Git installed and configured
- GLM-4.5 API key

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Get your GLM-4.5 API key
2. Edit the `.env` file and replace `your_api_key_here` with your actual API key:
   ```
   API_KEY=your_actual_api_key_here
   ```

## Usage

1. Stage your changes using `git add`:
   ```bash
   git add .
   ```

2. Run the Git Commit Crafter:
   ```bash
   npm start
   ```

3. The tool will:
   - Read your staged changes
   - Send them to the GLM-4.5 AI for analysis
   - Generate 5 professional commit message options
   - Display them in an interactive menu
   - Wait for you to select your preferred message
   - Commit your changes with the selected message

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
2. **AI Analysis**: Changes are sent to the GLM-4.5 AI with a carefully crafted prompt
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
- `axios`: For communicating with the GLM-4.5 API
- `inquirer`: For creating interactive CLI menus
- `ora`: For displaying loading spinners
- `chalk`: For adding colors to terminal output
- `dotenv`: For managing environment variables

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - see LICENSE file for details