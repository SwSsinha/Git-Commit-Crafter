import { execa } from 'execa';
import axios from 'axios';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to get staged git diff
const getStagedDiff = async () => {
  try {
    const { stdout } = await execa('git', ['diff', '--staged']);
    return stdout;
  } catch (error) {
    console.error(chalk.red('Error: No staged changes found. Please stage your files before committing.'));
    process.exit(1);
  }
};

// Function to create prompt for AI
const createPrompt = (diff) => {
  return `
    Based on the following code changes (git diff), please generate 5 potential commit messages.
    The messages should follow the Conventional Commits specification (e.g., "feat: ...", "fix: ...", "chore: ...").
    Reply with ONLY a numbered list of the commit messages and nothing else. Do not include any explanations or introductions.

    --- DIFF START ---
    ${diff}
    --- DIFF END ---
  `;
};

// Function to get AI suggestions
const getAiSuggestions = async (diff) => {
  const prompt = createPrompt(diff);
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error(chalk.red('Error: API key not configured. Please set your API key in the .env file.'));
    process.exit(1);
  }

  try {
    const response = await axios.post('https://api.z.ai/v1/chat/completions', {
      model: 'glm-4.5',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    // Parse the response to extract commit messages
    const content = response.data.choices[0].message.content;
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  } catch (error) {
    console.error(chalk.red('Error calling AI API:'), error.message);
    process.exit(1);
  }
};

// Function to display interactive menu for selecting commit message
const selectCommitMessage = async (choices) => {
  const { selectedMessage } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedMessage',
      message: 'Select a commit message:',
      choices: choices,
    },
  ]);
  return selectedMessage;
};

// Function to commit changes
const commitChanges = async (message) => {
  try {
    await execa('git', ['commit', '-m', message]);
  } catch (error) {
    console.error(chalk.red('Error committing changes:'), error.message);
    process.exit(1);
  }
};

// Main function to orchestrate the entire process
const main = async () => {
  console.log(chalk.blue.bold('🤖 Git Commit Crafter'));
  console.log(chalk.blue('Reading your staged changes...\n'));

  // Step 1: Get staged diff
  const diff = await getStagedDiff();

  // Step 2: Get AI suggestions with loading spinner
  const spinner = ora('🤖 The AI is crafting your commit messages...').start();
  const suggestions = await getAiSuggestions(diff);
  spinner.succeed(chalk.green('AI suggestions received!'));

  // Step 3: Display interactive menu
  console.log(chalk.yellow('\n💡 Here are your AI-generated commit messages:\n'));
  const selectedMessage = await selectCommitMessage(suggestions);

  // Step 4: Commit changes
  console.log(chalk.blue('\n📝 Committing your changes...'));
  await commitChanges(selectedMessage);

  // Step 5: Show success message
  console.log(chalk.green.bold('\n✔ Commit successful!'));
  console.log(chalk.gray(`Committed with: "${selectedMessage}"`));
};

// Run the main function
main().catch(error => {
  console.error(chalk.red('An unexpected error occurred:'), error.message);
  process.exit(1);
});