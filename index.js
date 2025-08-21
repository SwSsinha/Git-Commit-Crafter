import { execa } from 'execa';
import axios from 'axios';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const command = args.find(arg => arg.startsWith('--'))?.replace('--', '') || 'commit';
console.log("hey there!");
console.log("hey there!");


// Function to get staged git diff
const getStagedDiff = async () => {
  try {
    const { stdout } = await execa('git', ['diff', '--staged']);
    
    // Check if stdout is empty (no staged changes)
    if (!stdout || stdout.trim() === '') {
      console.error(chalk.red('Error: No staged changes found.'));
      console.error(chalk.yellow('Please stage your files using "git add" before running this tool.'));
      console.error(chalk.cyan('Example: git add .'));
      process.exit(1);
    }
    
    return stdout;
  } catch (error) {
    console.error(chalk.red('Error: Failed to read staged changes.'));
    console.error(chalk.yellow('Make sure you are in a git repository and have staged some changes.'));
    console.error(chalk.cyan('Example: git add .'));
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
    const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      model: 'glm-4',
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

// Function to push changes to remote repository
const pushChanges = async () => {
  try {
    console.log(chalk.blue('\n📤 Pushing changes to remote repository...'));
    await execa('git', ['push']);
    console.log(chalk.green.bold('\n✔ Changes pushed to remote successfully!'));
  } catch (error) {
    console.error(chalk.yellow('\n⚠ Warning: Failed to push changes to remote.'));
    console.error(chalk.yellow('The commit was created locally but not pushed to GitHub.'));
    console.error(chalk.yellow('You can push manually using: git push'));
    console.error(chalk.gray('Error details:'), error.message);
    // Don't exit here as the commit was successful locally
  }
};

// Function to ask if user wants to push to remote
const askToPush = async () => {
  const { shouldPush } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldPush',
      message: 'Would you like to push the commit to remote repository (GitHub)?',
      default: false,
    },
  ]);
  return shouldPush;
};


// Function to show repository status
const showStatus = async () => {
  try {
    console.log(chalk.blue.bold('📊 Repository Status'));
    
    // Get git status
    const { stdout: statusOutput } = await execa('git', ['status', '--porcelain']);
    
    if (!statusOutput) {
      console.log(chalk.green('✅ Working directory is clean'));
    } else {
      console.log(chalk.yellow('📁 Modified files:'));
      const lines = statusOutput.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const [status, ...fileParts] = line.split(' ');
        const file = fileParts.join(' ');
        let statusColor = chalk.red;
        let statusSymbol = '❌';
        
        if (status.includes('M')) {
          statusColor = chalk.yellow;
          statusSymbol = '📝';
        } else if (status.includes('A')) {
          statusColor = chalk.green;
          statusSymbol = '➕';
        } else if (status.includes('D')) {
          statusColor = chalk.red;
          statusSymbol = '🗑️';
        } else if (status.includes('R')) {
          statusColor = chalk.blue;
          statusSymbol = '🔄';
        }
        
        console.log(`  ${statusSymbol} ${statusColor(file)}`);
      });
    }
    
    // Get current branch
    const { stdout: branchOutput } = await execa('git', ['branch', '--show-current']);
    console.log(chalk.blue(`🌿 Current branch: ${branchOutput}`));
    
    // Get recent commits
    const { stdout: logOutput } = await execa('git', ['log', '--oneline', '-5']);
    console.log(chalk.blue('\n📜 Recent commits:'));
    logOutput.split('\n').forEach(line => {
      console.log(`  ${chalk.gray(line)}`);
    });
    
    // Check if remote is up to date
    try {
      await execa('git', ['fetch', '--dry-run']);
      console.log(chalk.green('\n✅ Remote is up to date'));
    } catch (error) {
      console.log(chalk.yellow('\n⚠ Remote has changes that need to be pulled or pushed'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error getting repository status:'), error.message);
    process.exit(1);
  }
};

// Function to sync with remote repository
const syncWithRemote = async () => {
  try {
    console.log(chalk.blue.bold('🔄 Syncing with Remote Repository'));
    
    // Check if there are any uncommitted changes
    const { stdout: statusOutput } = await execa('git', ['status', '--porcelain']);
    if (statusOutput) {
      console.log(chalk.yellow('\n⚠ You have uncommitted changes. Please commit or stash them before syncing.'));
      console.log(chalk.yellow('You can use "npm start" to commit your changes.'));
      return;
    }
    
    // Pull latest changes with merge strategy to handle divergent branches
    console.log(chalk.blue('\n⬇️ Pulling latest changes from remote...'));
    try {
      await execa('git', ['pull', '--no-rebase']);
      console.log(chalk.green('✅ Successfully pulled latest changes'));
    } catch (pullError) {
      if (pullError.message.includes('divergent branches') || pullError.message.includes('Need to specify how to reconcile divergent branches')) {
        console.log(chalk.yellow('\n⚠ Divergent branches detected. Using merge strategy to reconcile...'));
        
        // Configure pull to use merge instead of rebase for this repository
        await execa('git', ['config', 'pull.rebase', 'false']);
        
        // Try pulling again with merge strategy
        await execa('git', ['pull']);
        console.log(chalk.green('✅ Successfully merged remote changes'));
      } else {
        throw pullError;
      }
    }
    
    // Push local changes
    console.log(chalk.blue('\n⬆️ Pushing local changes to remote...'));
    await execa('git', ['push']);
    console.log(chalk.green('✅ Successfully pushed local changes'));
    
    console.log(chalk.green.bold('\n✅ Repository synchronized successfully!'));
    
  } catch (error) {
    console.error(chalk.red('Error syncing with remote:'), error.message);
    
    // Check if it's a merge conflict
    if (error.message.includes('merge conflict') || error.message.includes('CONFLICT')) {
      console.error(chalk.red('\n❌ Merge conflicts detected!'));
      console.error(chalk.yellow('Please resolve the conflicts manually and then run the sync command again.'));
      console.error(chalk.cyan('Steps to resolve conflicts:'));
      console.error(chalk.cyan('1. Open the conflicted files and look for <<<<<<<, =======, and >>>>>>> markers'));
      console.error(chalk.cyan('2. Edit the files to resolve the conflicts'));
      console.error(chalk.cyan('3. Run "git add ." to mark conflicts as resolved'));
      console.error(chalk.cyan('4. Run "git commit" to complete the merge'));
      console.error(chalk.cyan('5. Run "npm run sync" again to complete the synchronization'));
    } else {
      console.error(chalk.yellow('You may need to resolve conflicts manually'));
    }
    
    process.exit(1);
  }
};

// Function to clean up repository
const cleanRepository = async () => {
  try {
    console.log(chalk.blue.bold('🧹 Repository Cleanup'));
    
    // Check for untracked files
    const { stdout: untrackedOutput } = await execa('git', ['status', '--porcelain']);
    const untrackedFiles = untrackedOutput
      .split('\n')
      .filter(line => line.trim())
      .filter(line => line.startsWith('??'))
      .map(line => line.substring(3));
    
    if (untrackedFiles.length > 0) {
      console.log(chalk.yellow('\n📄 Untracked files found:'));
      untrackedFiles.forEach(file => console.log(`  ${chalk.gray(file)}`));
      
      const { shouldClean } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldClean',
          message: 'Would you like to remove these untracked files?',
          default: false,
        },
      ]);
      
      if (shouldClean) {
        console.log(chalk.blue('\n🗑️ Removing untracked files...'));
        await execa('git', ['clean', '-f']);
        console.log(chalk.green('✅ Untracked files removed'));
      }
    } else {
      console.log(chalk.green('\n✅ No untracked files found'));
    }
    
    // Check for branches that have been merged
    const { stdout: mergedOutput } = await execa('git', ['branch', '--merged']);
    const currentBranch = (await execa('git', ['branch', '--show-current'])).stdout.trim();
    const mergedBranches = mergedOutput
      .split('\n')
      .filter(line => line.trim())
      .filter(line => !line.includes('*'))
      .filter(line => !line.includes(currentBranch))
      .map(line => line.replace(/^\s+/, ''));
    
    if (mergedBranches.length > 0) {
      console.log(chalk.yellow('\n🌿 Merged branches that can be deleted:'));
      mergedBranches.forEach(branch => console.log(`  ${chalk.gray(branch)}`));
      
      const { shouldDelete } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldDelete',
          message: 'Would you like to delete these merged branches?',
          default: false,
        },
      ]);
      
      if (shouldDelete) {
        console.log(chalk.blue('\n🗑️ Deleting merged branches...'));
        for (const branch of mergedBranches) {
          await execa('git', ['branch', '-d', branch]);
        }
        console.log(chalk.green('✅ Merged branches deleted'));
      }
    } else {
      console.log(chalk.green('\n✅ No merged branches to delete'));
    }
    
    console.log(chalk.green.bold('\n✅ Repository cleanup completed!'));
    
  } catch (error) {
    console.error(chalk.red('Error cleaning repository:'), error.message);
    process.exit(1);
  }
};

// Function to manage branches
const manageBranches = async () => {
  try {
    console.log(chalk.blue.bold('🌿 Branch Management'));
    
    // Get all branches
    const { stdout: branchesOutput } = await execa('git', ['branch', '-a']);
    const branches = branchesOutput
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\s+|\s+$/g, ''))
      .map(line => line.replace(/^\*\s*/, ''))
      .map(line => line.replace('remotes/', ''));
    
    // Get current branch
    const currentBranch = (await execa('git', ['branch', '--show-current'])).stdout.trim();
    
    console.log(chalk.blue('\n📋 Available branches:'));
    branches.forEach(branch => {
      if (branch === currentBranch) {
        console.log(`  🌿 ${chalk.green.bold(branch)} (current)`);
      } else if (branch.startsWith('origin/')) {
        console.log(`  🌐 ${chalk.gray(branch)}`);
      } else {
        console.log(`  🌿 ${chalk.cyan(branch)}`);
      }
    });
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Create new branch', value: 'create' },
          { name: 'Switch to existing branch', value: 'switch' },
          { name: 'Delete branch', value: 'delete' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);
    
    if (action === 'create') {
      const { branchName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'branchName',
          message: 'Enter new branch name:',
          validate: input => input.trim() !== '' || 'Branch name cannot be empty',
        },
      ]);
      
      console.log(chalk.blue(`\n🌿 Creating branch "${branchName}"...`));
      await execa('git', ['checkout', '-b', branchName]);
      console.log(chalk.green(`✅ Branch "${branchName}" created and switched to`));
      
    } else if (action === 'switch') {
      const localBranches = branches.filter(branch => !branch.startsWith('origin/') && branch !== currentBranch);
      
      if (localBranches.length === 0) {
        console.log(chalk.yellow('\n⚠ No other local branches available'));
        return;
      }
      
      const { branchToSwitch } = await inquirer.prompt([
        {
          type: 'list',
          name: 'branchToSwitch',
          message: 'Select branch to switch to:',
          choices: localBranches,
        },
      ]);
      
      console.log(chalk.blue(`\n🔄 Switching to branch "${branchToSwitch}"...`));
      await execa('git', ['checkout', branchToSwitch]);
      console.log(chalk.green(`✅ Switched to branch "${branchToSwitch}"`));
      
    } else if (action === 'delete') {
      const localBranches = branches.filter(branch => !branch.startsWith('origin/') && branch !== currentBranch);
      
      if (localBranches.length === 0) {
        console.log(chalk.yellow('\n⚠ No branches available for deletion'));
        return;
      }
      
      const { branchToDelete } = await inquirer.prompt([
        {
          type: 'list',
          name: 'branchToDelete',
          message: 'Select branch to delete:',
          choices: localBranches,
        },
      ]);
      
      console.log(chalk.blue(`\n🗑️ Deleting branch "${branchToDelete}"...`));
      await execa('git', ['branch', '-d', branchToDelete]);
      console.log(chalk.green(`✅ Branch "${branchToDelete}" deleted`));
    }
    
  } catch (error) {
    console.error(chalk.red('Error managing branches:'), error.message);
    process.exit(1);
  }
};

// Function to create a release
const createRelease = async () => {
  try {
    console.log(chalk.blue.bold('🚀 Release Management'));
    
    // Get current branch
    const currentBranch = (await execa('git', ['branch', '--show-current'])).stdout.trim();
    
    if (currentBranch !== 'main') {
      console.log(chalk.yellow(`\n⚠ You are currently on branch "${currentBranch}"`));
      console.log(chalk.yellow('Releases are typically created from the main branch'));
      
      const { continueAnyway } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAnyway',
          message: 'Do you want to continue anyway?',
          default: false,
        },
      ]);
      
      if (!continueAnyway) {
        return;
      }
    }
    
    // Get latest tags
    const { stdout: tagsOutput } = await execa('git', ['tag', '--sort=-version:refname', '-l', 'v*']);
    const tags = tagsOutput.split('\n').filter(tag => tag.trim());
    
    console.log(chalk.blue('\n🏷️ Latest releases:'));
    tags.slice(0, 5).forEach(tag => console.log(`  ${chalk.cyan(tag)}`));
    
    // Get version for new release
    const { version } = await inquirer.prompt([
      {
        type: 'input',
        name: 'version',
        message: 'Enter version for new release (e.g., v1.0.0):',
        validate: input => {
          if (!input.trim()) return 'Version cannot be empty';
          if (!input.startsWith('v')) return 'Version should start with "v"';
          return true;
        },
      },
    ]);
    
    // Get release notes
    const { releaseNotes } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'releaseNotes',
        message: 'Enter release notes:',
      },
    ]);
    
    // Create tag
    console.log(chalk.blue(`\n🏷️ Creating tag "${version}"...`));
    await execa('git', ['tag', '-a', version, '-m', `Release ${version}`]);
    console.log(chalk.green(`✅ Tag "${version}" created`));
    
    // Push tag
    console.log(chalk.blue(`\n⬆️ Pushing tag "${version}" to remote...`));
    await execa('git', ['push', 'origin', version]);
    console.log(chalk.green(`✅ Tag "${version}" pushed to remote`));
    
    console.log(chalk.green.bold('\n✅ Release created successfully!'));
    console.log(chalk.blue(`🔗 View your release at: https://github.com/${(await execa('git', ['remote', 'get-url', 'origin'])).stdout.replace('git@github.com:', '').replace('.git', '')}/releases/tag/${version}`));
    
  } catch (error) {
    console.error(chalk.red('Error creating release:'), error.message);
    process.exit(1);
  }
};

// Main function to orchestrate the entire process
const main = async () => {
  // Route to different functions based on command
  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'sync':
      await syncWithRemote();
      break;
    case 'clean':
      await cleanRepository();
      break;
    case 'branch':
      await manageBranches();
      break;
    case 'release':
      await createRelease();
      break;
    case 'commit':
    default:
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

      // Step 6: Ask if user wants to push to remote
      const shouldPush = await askToPush();
      if (shouldPush) {
        await pushChanges();
      } else {
        console.log(chalk.blue('\n💡 Tip: You can push your changes later using "git push"'));
      }
      break;
  }
};

// Run the main function
main().catch(error => {
  console.error(chalk.red('An unexpected error occurred:'), error.message);
  process.exit(1);
});

