# Ollama Web UI

A customizable web interface for interacting with Ollama models.

## Overview

This application allows users to interact with locally hosted large language models through a modern web interface. 

## Features

- **Chat Interface**: User-friendly chat interface for interacting with models.
- **Customization**: Change system prompts or switch models easily.
- **Locally Hosted**: Operates entirely on your machine.

## Prerequisites

1. **Ollama**: Download and install Ollama from [https://ollama.com/](https://ollama.com/).
2. **Node.js and npm**: Install Node.js from [https://nodejs.org/](https://nodejs.org/).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ollama-web-ui.git
   cd ollama-web-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Ollama in the background:
   ```bash
   ollama
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Building the Application

To create a production build:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## File Structure

```
ollama-web-ui/
├── app/                 # Application logic
├── components/          # Reusable components
├── hooks/               # Custom hooks
├── lib/                 # Helper libraries
├── public/              # Static assets
├── styles/              # Styling files
├── next.config.mjs      # Next.js configuration
├── package.json         # Project metadata and dependencies
├── README.md            # Project documentation
└── .gitignore           # Ignored files and folders
```

## Troubleshooting

- **Cannot connect to Ollama**: Ensure that Ollama is running in the background.
- **Dependencies not installing**: Make sure Node.js and npm are correctly installed.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
