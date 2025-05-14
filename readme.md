# Chat App UI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A modern, responsive Chat App UI that allows users to create custom chatbots, manage conversations with multiple AI models, and enhance interactions with file uploads.

Developed by [Aron Prins](https://github.com/aronprins) of Aron & Sharon.

![AI Chat App Preview](https://github.com/user-attachments/assets/fc191791-d4e6-406c-a2c8-336980bf8f04)

# Chat App UI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A modern, responsive Chat App UI that allows users to create custom chatbots, manage conversations with multiple AI models, and enhance interactions with file uploads.

Developed by [Aron Prins](https://github.com/aronprins) of Aron & Sharon.

## ✨ Features

- **Multiple AI Models**: Switch between different AI models (Claude, GPT-4, etc.) for each conversation
- **Custom Chatbots**: Create specialized chatbots with custom instructions and knowledge bases
- **File Integration**: Upload files to chatbots for context-aware conversations
- **Conversation Management**: Create, save, search, and organize multiple chat threads
- **Theme Customization**: Dark/light mode, accent colors, and font size options
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Data Persistence**: All conversations, chatbots, and settings are saved locally

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aronprins/chat-app-ui.git
   cd chat-app-ui
   ```

2. Open the application:
   You can either:
   - Open the `index.html` file directly in your browser
   - Use a local server (for best experience):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```

3. Access the application at `http://localhost:8000` (or whichever port your server uses)

## 💻 Usage

### Creating a New Chatbot

1. Click on the bot selector dropdown in the header
2. Click "New Bot"
3. Configure your chatbot with:
   - Name
   - Avatar
   - Description
   - Detailed instructions
   - Default AI model

### Uploading Files

1. Click the file icon in the chat header
2. Drag and drop files or click to browse
3. Supported formats include PDF, TXT, CSV, DOCX, XLSX, JPG, PNG

### Customizing Settings

1. Click the settings icon in the sidebar
2. Navigate through tabs to customize:
   - User information
   - Appearance and theme
   - Default models
   - Privacy options
   - Advanced parameters

## 🛠️ Technology Stack

- **HTML5** - Structure and semantic markup
- **CSS3** - Styling with custom properties and responsive design
- **JavaScript** - Core functionality and interactions
- **LocalStorage API** - Data persistence

The application is purely frontend-based with no external dependencies or frameworks, making it lightweight and easy to deploy.

## 📝 Adding API Integration

This project currently uses simulated AI responses. To integrate with real AI APIs:

1. Modify the `sendMessage` function to call your preferred AI API
2. Add API keys in the settings panel
3. Implement proper authentication and request handling

Example API endpoints:
- Anthropic Claude: `https://api.anthropic.com/v1/messages`
- OpenAI: `https://api.openai.com/v1/chat/completions`

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

Aron Prins - [@aronprins](https://github.com/aronprins)

Project Link: [https://github.com/aronprins/chat-app-ui](https://github.com/aronprins/chat-app-ui)

---

Developed with ❤️ by [Aron & Sharon](https://www.aronandsharon.com)