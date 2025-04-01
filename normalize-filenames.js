import fs from 'fs';
import path from 'path';

/**
 * Configuration for the file name normalizer
 * Customize these settings to control how files are renamed
 */
const config = {
  // Directory to process
  sourceDir: './test_directory', // Change this to your directory
  
  // Naming style: 'snake_case', 'kebab-case', 'camelCase', 'PascalCase', 'lowercase'
  namingStyle: 'kebab-case',
  
  // Character replacements (special characters and what to replace them with)
  replacements: {
    '&': 'and',
    '+': 'plus',
    '@': 'at',
  },
  
  // Characters to remove entirely
  removeChars: ['!', '#', '%', '{', '}', '[', ']'],
  
  // Whether to process subdirectories
  recursive: true,
  
  // Whether to actually rename files or just simulate (dry run)
  dryRun: true, // Keep true for testing first!
  
  // Whether to normalize directories as well as files
  normalizeDirs: true,
  
  // How to handle spaces
  spaceReplacement: '-', // or '_', or ''
};

/**
 * Normalize a filename according to the specified style
 * @param {string} filename - The original filename
 * @param {boolean} isDirectory - Whether this is a directory
 * @returns {string} - The normalized filename
 */
function normalizeFilename(filename, isDirectory) {
  // If it's a file, separate the extension
  let name = filename;
  let ext = '';
  
  if (!isDirectory) {
    ext = path.extname(filename);
    name = path.basename(filename, ext);
  }
  
  // Replace special characters according to config
  Object.entries(config.replacements).forEach(([char, replacement]) => {
    name = name.split(char).join(replacement);
  });
  
  // Remove unwanted characters
  config.removeChars.forEach(char => {
    name = name.split(char).join('');
  });
  
  // Replace spaces
  name = name.split(' ').join(config.spaceReplacement);
  
  // Apply the selected naming style
  switch (config.namingStyle) {
    case 'snake_case':
      // Convert to lowercase with underscores
      name = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      // Replace multiple consecutive underscores with a single one
      name = name.replace(/_+/g, '_');
      // Remove leading/trailing underscores
      name = name.replace(/^_+|_+$/g, '');
      break;
      
    case 'kebab-case':
      // Convert to lowercase with hyphens
      name = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
      // Replace multiple consecutive hyphens with a single one
      name = name.replace(/-+/g, '-');
      // Remove leading/trailing hyphens
      name = name.replace(/^-+|-+$/g, '');
      break;
      
    case 'camelCase':
      // Convert to camelCase
      name = name.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
      name = name.split(/\s+/).map((word, index) => {
        if (!word) return '';
        return index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join('');
      break;
      
    case 'PascalCase':
      // Convert to PascalCase
      name = name.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
      name = name.split(/\s+/).map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join('');
      break;
      
    case 'lowercase':
      // Convert to simple lowercase with no spaces
      name = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      break;
  }
  
  // Ensure we have a valid filename (not empty)
  if (!name) {
    name = 'unnamed';
  }
  
  // Reattach the extension for files
  return name + ext;
}

/**
 * Check if a path is a hidden file or directory (starts with .)
 * @param {string} itemPath - Path to check
 * @returns {boolean} - True if the path is hidden
 */
function isHidden(itemPath) {
  const basename = path.basename(itemPath);
  return basename.startsWith('.');
}

/**
 * Process a directory and normalize all filenames
 * @param {string} dirPath - Path to the directory to process
 * @param {Array} changes - Array to collect changes for reporting
 */
function processDirectory(dirPath, changes = []) {
  try {
    // Get all files and directories in the current directory
    const items = fs.readdirSync(dirPath);
    
    // First, collect all the items and their new names
    const itemsToRename = [];
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      
      // Skip hidden files/directories
      if (isHidden(itemPath)) {
        console.log(`Skipping hidden item: ${itemPath}`);
        continue;
      }
      
      // Check if the item exists and get its stats
      let stats;
      try {
        stats = fs.statSync(itemPath);
      } catch (err) {
        console.error(`Error accessing ${itemPath}: ${err.message}`);
        continue;
      }
      
      const isDirectory = stats.isDirectory();
      
      // Skip directories if not configured to normalize them
      if (isDirectory && !config.normalizeDirs) continue;
      
      // Get the normalized name
      const normalizedName = normalizeFilename(item, isDirectory);
      
      // Skip if the name wouldn't change
      if (normalizedName === item) continue;
      
      // Check for potential conflicts (same normalized name)
      const newPath = path.join(dirPath, normalizedName);
      if (fs.existsSync(newPath)) {
        console.warn(`Warning: Cannot rename ${itemPath} to ${newPath} - destination already exists`);
        continue;
      }
      
      // Add to the list of items to rename
      itemsToRename.push({
        oldPath: itemPath,
        newPath: newPath,
        isDirectory
      });
      
      // Record the change
      changes.push({
        type: isDirectory ? 'directory' : 'file',
        oldName: itemPath,
        newName: newPath
      });
    }
    
    // Process subdirectories first (if recursive)
    if (config.recursive) {
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        
        // Skip hidden directories
        if (isHidden(itemPath)) continue;
        
        try {
          const stats = fs.statSync(itemPath);
          if (stats.isDirectory()) {
            processDirectory(itemPath, changes);
          }
        } catch (err) {
          console.error(`Error processing ${itemPath}: ${err.message}`);
        }
      }
    }
    
    // Now rename the items (files first, then directories)
    // This order prevents issues with renaming parent directories before children
    
    // First rename files
    itemsToRename
      .filter(item => !item.isDirectory)
      .forEach(item => {
        if (!config.dryRun) {
          try {
            fs.renameSync(item.oldPath, item.newPath);
            console.log(`Renamed: ${item.oldPath} -> ${item.newPath}`);
          } catch (err) {
            console.error(`Error renaming ${item.oldPath}: ${err.message}`);
          }
        } else {
          console.log(`Would rename: ${item.oldPath} -> ${item.newPath}`);
        }
      });
    
    // Then rename directories (in reverse order to handle nested dirs)
    itemsToRename
      .filter(item => item.isDirectory)
      .reverse()
      .forEach(item => {
        if (!config.dryRun) {
          try {
            fs.renameSync(item.oldPath, item.newPath);
            console.log(`Renamed: ${item.oldPath} -> ${item.newPath}`);
          } catch (err) {
            console.error(`Error renaming ${item.oldPath}: ${err.message}`);
          }
        } else {
          console.log(`Would rename: ${item.oldPath} -> ${item.newPath}`);
        }
      });
    
  } catch (err) {
    console.error(`Error processing directory ${dirPath}: ${err.message}`);
  }
}

/**
 * Main function to start the normalization process
 */
function normalizeFileNames() {
  console.log(`Starting file name normalization in ${config.sourceDir}`);
  console.log(`Mode: ${config.dryRun ? 'Dry run (no changes will be made)' : 'Live run'}`);
  console.log(`Naming style: ${config.namingStyle}`);
  
  // Check if the source directory exists
  if (!fs.existsSync(config.sourceDir)) {
    console.error(`Error: Directory ${config.sourceDir} does not exist`);
    return;
  }
  
  // Array to collect all changes for reporting
  const changes = [];
  
  // Process the directory
  processDirectory(config.sourceDir, changes);
  
  // Print summary
  console.log('\nSummary:');
  console.log(`Total items that would be renamed: ${changes.length}`);
  console.log(`Files: ${changes.filter(c => c.type === 'file').length}`);
  console.log(`Directories: ${changes.filter(c => c.type === 'directory').length}`);
  
  if (config.dryRun) {
    console.log('\nThis was a dry run. No files were actually renamed.');
    console.log('Set config.dryRun = false to apply these changes.');
  }
}

// Run the normalizer
normalizeFileNames();
