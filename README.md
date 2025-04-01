# Filename Normalizer

A powerful Node.js utility that brings order to chaotic file systems by normalizing filenames and directories to follow consistent naming conventions.


## Features

- **Multiple naming styles** - Convert to kebab-case, snake_case, camelCase, PascalCase, or lowercase
- **Recursive processing** - Handles entire directory trees with a single command
- **Special character handling** - Replace or remove problematic characters
- **Dry run mode** - Preview changes before applying them
- **Configurable options** - Customize the behavior to suit your needs
- **Smart directory handling** - Processes directories in the correct order to avoid path issues


## Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Examples](#-examples)
- [Use Cases](#-use-cases)
- [Contributing](#-contributing)
- [License](#-license)


## Installation

```shellscript
# Clone the repository
git clone https://github.com/pilot2254/filename-normalizer.git

# Navigate to the project directory
cd filename-normalizer

# Make the script executable (Unix/Linux/macOS)
chmod +x normalize-filenames.js
```

## Quick Start

1. Edit the configuration in `normalize-filenames.js` to set your source directory and preferences
2. Run in dry-run mode first to preview changes:


```shellscript
node normalize-filenames.js
```

3. When satisfied with the proposed changes, set `dryRun: false` in the config and run again:


```shellscript
node normalize-filenames.js
```

## Configuration

The script is customizable through the `config` object at the top of the file:

```javascript
const config = {
  // Directory to process
  sourceDir: './your_directory',
  
  // Naming style: 'snake_case', 'kebab-case', 'camelCase', 'PascalCase', 'lowercase'
  namingStyle: 'kebab-case',
  
  // Character replacements (special characters and what to replace them with)
  replacements: {
    '&': 'and',
    '+': 'plus',
    '@': 'at',
    // Add your own replacements
  },
  
  // Characters to remove entirely
  removeChars: ['!', '#', '%', '{', '}', '[', ']'],
  
  // Whether to process subdirectories
  recursive: true,
  
  // Whether to actually rename files or just simulate (dry run)
  dryRun: true,
  
  // Whether to normalize directories as well as files
  normalizeDirs: true,
  
  // How to handle spaces
  spaceReplacement: '-', // or '_', or ''
};
```

### Configuration Options Explained

| Option | Description | Default
|-----|-----|-----
| `sourceDir` | Directory to process | `'./test_directory'`
| `namingStyle` | Naming convention to apply | `'kebab-case'`
| `replacements` | Map of characters to replace | `{ '&': 'and', '+': 'plus', '@': 'at' }`
| `removeChars` | Characters to remove entirely | `['!', '#', '%', '{', '}', '[', ']']`
| `recursive` | Process subdirectories | `true`
| `dryRun` | Preview changes without applying | `true`
| `normalizeDirs` | Apply to directory names | `true`
| `spaceReplacement` | Character to replace spaces | `'-'`


## Examples

### Before and After Examples

| Original Filename | snake_case | kebab-case | camelCase | PascalCase
|-----|-----|-----
| "My Photos.jpg" | my_photos.jpg | my-photos.jpg | myPhotos.jpg | MyPhotos.jpg
| "Notes & Ideas" | notes_and_ideas | notes-and-ideas | notesAndIdeas | NotesAndIdeas
| "project-files(old)" | project_files_old | project-files-old | projectFilesOld | ProjectFilesOld
| "User's Data.txt" | users_data.txt | users-data.txt | usersData.txt | UsersData.txt


### Example: Converting to kebab-case

```javascript
const config = {
  sourceDir: './my_project',
  namingStyle: 'kebab-case',
  dryRun: false
};
```

### Example: Converting to camelCase (files only)

```javascript
const config = {
  sourceDir: './src',
  namingStyle: 'camelCase',
  normalizeDirs: false,
  dryRun: false
};
```

## Use Cases

### Web Development

Standardize filenames for web projects to ensure consistent URLs and prevent case-sensitivity issues:

```javascript
const config = {
  sourceDir: './public',
  namingStyle: 'kebab-case',
  recursive: true
};
```

### Photo Collections

Clean up camera-generated filenames or inconsistent manual names:

```javascript
const config = {
  sourceDir: './photos',
  namingStyle: 'snake_case',
  replacements: {
    'IMG_': '',
    'DSC': '',
    'DCIM': ''
  }
};
```

### Code Repositories

Enforce consistent naming across a codebase:

```javascript
const config = {
  sourceDir: './src',
  namingStyle: 'camelCase',
  normalizeDirs: false
};
```

## Advanced Usage

### Processing Multiple Directories

```javascript
const directories = ['./photos', './documents', './music'];

directories.forEach(dir => {
  config.sourceDir = dir;
  normalizeFileNames();
});
```

### Custom Naming Function

You can extend the script by adding your own naming function:

```javascript
// Add to the switch statement in normalizeFilename function
case 'custom':
  // Your custom naming logic here
  name = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  // Add any other transformations
  break;
```

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


### Ideas for Contributions

- Add command-line argument support
- Implement conflict resolution strategies
- Add pattern-based file exclusions
- Create an undo functionality
- Add support for custom regex patterns


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
