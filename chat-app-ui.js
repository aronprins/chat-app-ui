// DOM Elements
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const chatList = document.getElementById('chat-list');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const searchInput = document.getElementById('search-input');
const emptyChat = document.getElementById('empty-chat');
const modelSelect = document.getElementById('model-select');
const currentChatTitle = document.getElementById('current-chat-title');

// State variables
let conversations = [];
let currentChatId = null;
let bots = [];
let currentBotId = 'default';
let uploadedFiles = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initBots();
    
    // Set up event listeners
    setupEventListeners();
});

// ==========================================
// App Initialization
// ==========================================

function initApp() {
    // Load conversations from localStorage
    loadConversations();
    renderConversationList();
    
    // If there are conversations, load the most recent one
    if (conversations.length > 0) {
        loadConversation(conversations[0].id);
    } else {
        showEmptyState();
    }
}

function loadConversations() {
    const savedConversations = localStorage.getItem('ai-chat-conversations');
    if (savedConversations) {
        conversations = JSON.parse(savedConversations);
    }
}

function saveConversations() {
    localStorage.setItem('ai-chat-conversations', JSON.stringify(conversations));
}

function initBots() {
    const savedBots = localStorage.getItem('ai-chat-bots');
    if (savedBots) {
        bots = JSON.parse(savedBots);
    } else {
        // Create default bot
        bots = [{
            id: 'default',
            name: 'Default AI',
            avatar: 'AI',
            description: 'General purpose assistant',
            instructions: '',
            defaultModel: 'claude-3-7-sonnet',
            files: []
        }];
        saveBots();
    }
    
    // Initialize file storage
    uploadedFiles = JSON.parse(localStorage.getItem('ai-chat-files') || '{}');
    
    renderBotList();
    loadBot('default');
}

function saveBots() {
    localStorage.setItem('ai-chat-bots', JSON.stringify(bots));
}

function saveFiles() {
    localStorage.setItem('ai-chat-files', JSON.stringify(uploadedFiles));
}

// ==========================================
// Event Listeners Setup
// ==========================================

function setupEventListeners() {
    // Sidebar and chat navigation
    menuToggle.addEventListener('click', toggleSidebar);
    newChatBtn.addEventListener('click', startNewChat);
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', handleInputKeydown);
    searchInput.addEventListener('input', searchConversations);
    modelSelect.addEventListener('change', updateConversationModel);
    
    // Bot selector
    document.getElementById('bot-selector-toggle').addEventListener('click', toggleBotSelector);
    document.getElementById('create-bot-btn').addEventListener('click', showCreateBotModal);
    
    // Bot files
    document.getElementById('bot-files-btn').addEventListener('click', toggleBotFilesPanel);
    document.getElementById('bot-files-close').addEventListener('click', toggleBotFilesPanel);
    
    // File upload
    document.getElementById('upload-file-btn').addEventListener('click', showFileUploadModal);
    document.getElementById('upload-bot-file-btn').addEventListener('click', showFileUploadModal);
    document.getElementById('add-bot-file-btn').addEventListener('click', showFileUploadModal);
    document.getElementById('file-upload-close').addEventListener('click', closeFileUploadModal);
    document.getElementById('file-upload-cancel').addEventListener('click', closeFileUploadModal);
    document.getElementById('file-upload-submit').addEventListener('click', uploadFilesToBot);
    
    // File drag and drop
    setupFileDragDrop();
    
    // Create bot modal
    document.getElementById('create-bot-close').addEventListener('click', closeCreateBotModal);
    document.getElementById('create-bot-cancel').addEventListener('click', closeCreateBotModal);
    document.getElementById('create-bot-submit').addEventListener('click', createNewBot);
    
    // Character counter for bot instructions
    const botInstructions = document.getElementById('bot-instructions');
    const charCounter = botInstructions.parentNode.querySelector('span');
    
    botInstructions.addEventListener('input', () => {
        const count = botInstructions.value.length;
        charCounter.textContent = `${count}/2000`;
        
        if (count > 2000) {
            charCounter.style.color = '#ef4444';
        } else {
            charCounter.style.color = '';
        }
    });
    
    // Avatar selection
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    // Settings modal
    setupSettingsModal();
    
    // Close bot selector when clicking outside
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.bot-selector') && !e.target.closest('.create-bot-modal')) {
            document.getElementById('bot-selector-dropdown').classList.remove('show');
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

function setupFileDragDrop() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileUploadInput = document.getElementById('file-upload-input');
    
    fileUploadInput.addEventListener('change', () => {
        handleFileSelection(fileUploadInput.files);
    });
    
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--primary-color)';
        fileUploadArea.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.style.borderColor = 'var(--border-color)';
        fileUploadArea.style.backgroundColor = '';
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--border-color)';
        fileUploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            fileUploadInput.files = e.dataTransfer.files;
            handleFileSelection(fileUploadInput.files);
        }
    });
}

function setupSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModalBackdrop = document.getElementById('settings-modal-backdrop');
    const settingsClose = document.getElementById('settings-close');
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    const settingsTitle = document.getElementById('settings-title');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    // Open settings modal
    settingsBtn.addEventListener('click', () => {
        settingsModalBackdrop.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    });
    
    // Close settings modal
    function closeSettingsModal() {
        settingsModalBackdrop.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    settingsClose.addEventListener('click', closeSettingsModal);
    cancelSettingsBtn.addEventListener('click', closeSettingsModal);
    
    // Close modal when clicking outside
    settingsModalBackdrop.addEventListener('click', (e) => {
        if (e.target === settingsModalBackdrop) {
            closeSettingsModal();
        }
    });
    
    // Tab switching
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and panels
            settingsTabs.forEach(t => t.classList.remove('active'));
            settingsPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to current tab
            tab.classList.add('active');
            
            // Get tab data and activate corresponding panel
            const tabId = tab.dataset.tab;
            document.getElementById(`${tabId}-panel`).classList.add('active');
            
            // Update title
            settingsTitle.textContent = tab.textContent.trim() + ' Settings';
        });
    });
    
    // Color picker
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            colorOptions.forEach(o => o.classList.remove('active'));
            
            // Add active class to selected option
            option.classList.add('active');
            
            // Update accent color
            const color = option.dataset.color;
            document.documentElement.style.setProperty('--primary-color', color);
            
            // Update hover color (slightly darker)
            const hoverColor = adjustColorBrightness(color, -15);
            document.documentElement.style.setProperty('--primary-hover', hoverColor);
        });
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', () => {
        // Get form values
        const settings = {
            user: {
                name: document.getElementById('display-name').value,
                email: document.getElementById('email').value
            },
            notifications: {
                newMessages: document.getElementById('notify-new-messages').checked,
                mentions: document.getElementById('notify-mentions').checked,
                sound: document.getElementById('sound-notifications').checked
            },
            appearance: {
                darkMode: document.getElementById('dark-mode').checked,
                accentColor: document.querySelector('.color-option.active').dataset.color,
                fontSize: document.getElementById('font-size').value,
                compactMode: document.getElementById('compact-mode').checked
            },
            models: {
                defaultModel: document.getElementById('default-model').value,
                apiKeys: {
                    anthropic: document.getElementById('anthropic-key').value,
                    openai: document.getElementById('openai-key').value
                }
            },
            privacy: {
                saveConversations: document.getElementById('save-conversations').checked,
                anonymizeData: document.getElementById('anonymize-data').checked
            },
            advanced: {
                maxTokens: parseInt(document.getElementById('max-tokens').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                streaming: document.getElementById('streaming').checked,
                debugMode: document.getElementById('debug-mode').checked,
                showTokenCount: document.getElementById('show-token-count').checked
            }
        };
        
        // Save settings to localStorage
        localStorage.setItem('ai-chat-settings', JSON.stringify(settings));
        
        // Update UI
        updateUIFromSettings(settings);
        
        // Close modal
        closeSettingsModal();
        
        // Show notification
        showNotification('Settings saved successfully');
    });
    
    // Clear all data
    document.getElementById('clear-data').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all conversations? This action cannot be undone.')) {
            localStorage.removeItem('ai-chat-conversations');
            conversations = [];
            renderConversationList();
            showEmptyState();
            showNotification('All conversations cleared');
        }
    });
    
    // Export data
    document.getElementById('export-data').addEventListener('click', () => {
        const data = {
            conversations: conversations,
            settings: JSON.parse(localStorage.getItem('ai-chat-settings') || '{}')
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-chat-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully');
    });
}

// ==========================================
// Conversation Management
// ==========================================

function toggleSidebar() {
    sidebar.classList.toggle('open');
}

function startNewChat() {
    const newChat = {
        id: Date.now().toString(),
        title: 'New Chat',
        model: modelSelect.value,
        botId: currentBotId, // Add botId to the conversation
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    conversations.unshift(newChat);
    saveConversations();
    renderConversationList();
    loadConversation(newChat.id);
    
    if (sidebar.classList.contains('open')) {
        toggleSidebar();
    }
}

function loadConversation(chatId) {
    currentChatId = chatId;
    const conversation = conversations.find(chat => chat.id === chatId);
    
    if (!conversation) return;
    
    // Update UI
    modelSelect.value = conversation.model;
    
    // Show chat messages
    renderMessages(conversation.messages);
    
    // Mark as active in sidebar
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === chatId) {
            item.classList.add('active');
        }
    });
    
    hideEmptyState();
}

function renderConversationList() {
    chatList.innerHTML = '';
    
    conversations.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.id = chat.id;
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        chatItem.innerHTML = `
            <div class="chat-item-title">${chat.title}</div>
            <div class="chat-item-actions">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="edit-chat" data-id="${chat.id}"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="delete-chat" data-id="${chat.id}"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </div>
        `;
        
        chatItem.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-item-actions')) {
                loadConversation(chat.id);
                if (sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            }
        });
        
        chatList.appendChild(chatItem);
    });
    
    // Add event listeners for edit and delete actions
    document.querySelectorAll('.edit-chat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatId = btn.dataset.id;
            editChatTitle(chatId);
        });
    });
    
    document.querySelectorAll('.delete-chat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatId = btn.dataset.id;
            deleteChat(chatId);
        });
    });
}

function renderMessages(messages) {
    chatMessages.innerHTML = '';
    
    messages.forEach(message => {
        const messageEl = createMessageElement(message);
        chatMessages.appendChild(messageEl);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageElement(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = message.role === 'ai' ? 'AI' : 'U';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.content;
    
    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = formatTime(message.timestamp);
    
    const actionsEl = document.createElement('div');
    actionsEl.className = 'message-actions';
    
    if (message.role === 'ai') {
        actionsEl.innerHTML = `
            <span class="message-action">Copy</span>
            <span class="message-action">Regenerate</span>
        `;
    }
    
    content.appendChild(timeEl);
    content.appendChild(actionsEl);
    
    messageEl.appendChild(avatar);
    messageEl.appendChild(content);
    
    return messageEl;
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Find current conversation
    const conversation = conversations.find(chat => chat.id === currentChatId);
    if (!conversation) {
        startNewChat();
        return sendMessage();
    }
    
    // Add user message
    const userMessage = {
        role: 'human',
        content: message,
        timestamp: Date.now()
    };
    conversation.messages.push(userMessage);
    
    // Update conversation title if it's the first message
    if (conversation.title === 'New Chat' && conversation.messages.length === 1) {
        conversation.title = message.length > 20 ? message.substring(0, 20) + '...' : message;
    }
    
    // Render the message immediately
    const messageEl = createMessageElement(userMessage);
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Clear input and resize
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Save to localStorage
    saveConversations();
    renderConversationList();
    
    // Get bot context if this is a bot conversation
    let botContext = '';
    if (conversation.botId) {
        const bot = bots.find(b => b.id === conversation.botId);
        if (bot) {
            botContext = getBotContext(bot);
        }
    }
    
    // Simulate AI response with bot context
    simulateAIResponse(conversation, botContext);
}

function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function simulateAIResponse(conversation, botContext = '') {
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai typing';
    typingIndicator.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate typing delay (longer for bot with context)
    const typingDelay = botContext ? 2000 : 1500;
    
    setTimeout(() => {
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        
        // Add AI response
        let response;
        
        if (botContext) {
            // For bots with context, generate more contextual responses
            const botResponses = [
                "Based on the information in my files and instructions, I can provide the following insights...",
                "I've analyzed the data you've uploaded and can tell you that...",
                "According to the files I have access to, here's what I know about your question...",
                "Let me analyze this based on my specialized knowledge and the files you've provided...",
                "Using the context from my configuration and uploaded files, I can answer this as follows..."
            ];
            response = botResponses[Math.floor(Math.random() * botResponses.length)];
        } else {
            // Generic responses for standard chats
            const responses = [
                "I understand your query. Let me provide some insights on this topic.",
                "That's an interesting question. Here's what I know about it.",
                "Thanks for asking. Based on my knowledge, I can tell you the following.",
                "I'd be happy to help with that. Here's some information that might be useful.",
                "Great question! Let me share some relevant information with you."
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        const aiMessage = {
            role: 'ai',
            content: response,
            timestamp: Date.now(),
            model: conversation.model
        };
        
        conversation.messages.push(aiMessage);
        
        const messageEl = createMessageElement(aiMessage);
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Save conversation
        saveConversations();
    }, typingDelay);
}

function searchConversations() {
    const query = searchInput.value.toLowerCase();
    
    if (!query) {
        renderConversationList();
        return;
    }
    
    const filteredConversations = conversations.filter(chat => {
        // Search in title
        if (chat.title.toLowerCase().includes(query)) return true;
        
        // Search in messages
        return chat.messages.some(msg => 
            msg.content.toLowerCase().includes(query)
        );
    });
    
    // Render filtered list
    chatList.innerHTML = '';
    
    if (filteredConversations.length === 0) {
        chatList.innerHTML = '<div class="no-results">No conversations found</div>';
        return;
    }
    
    filteredConversations.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.id = chat.id;
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        chatItem.innerHTML = `
            <div class="chat-item-title">${chat.title}</div>
            <div class="chat-item-actions">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="edit-chat" data-id="${chat.id}"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="delete-chat" data-id="${chat.id}"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </div>
        `;
        
        chatItem.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-item-actions')) {
                loadConversation(chat.id);
                if (sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            }
        });
        
        chatList.appendChild(chatItem);
    });
    
    // Add event listeners for edit and delete actions
    document.querySelectorAll('.edit-chat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatId = btn.dataset.id;
            editChatTitle(chatId);
        });
    });
    
    document.querySelectorAll('.delete-chat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatId = btn.dataset.id;
            deleteChat(chatId);
        });
    });
}

function editChatTitle(chatId) {
    const chat = conversations.find(c => c.id === chatId);
    if (!chat) return;
    
    const newTitle = prompt('Enter new conversation title:', chat.title);
    if (newTitle !== null && newTitle.trim() !== '') {
        chat.title = newTitle.trim();
        saveConversations();
        renderConversationList();
    }
}

function deleteChat(chatId) {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    const index = conversations.findIndex(c => c.id === chatId);
    if (index !== -1) {
        conversations.splice(index, 1);
        saveConversations();
        renderConversationList();
        
        if (chatId === currentChatId) {
            if (conversations.length > 0) {
                loadConversation(conversations[0].id);
            } else {
                currentChatId = null;
                showEmptyState();
            }
        }
    }
}

function updateConversationModel() {
    if (!currentChatId) return;
    
    const conversation = conversations.find(chat => chat.id === currentChatId);
    if (conversation) {
        conversation.model = modelSelect.value;
        saveConversations();
                
        // Update bot default model if this is a bot conversation
        if (conversation.botId) {
            const bot = bots.find(b => b.id === conversation.botId);
            if (bot) {
                bot.defaultModel = modelSelect.value;
                saveBots();
            }
        }
    }
}

// ==========================================
// Bot Management
// ==========================================

function renderBotList() {
    const botList = document.getElementById('bot-list');
    botList.innerHTML = '';
    
    bots.forEach(bot => {
        const botItem = document.createElement('div');
        botItem.className = 'bot-item';
        botItem.dataset.botId = bot.id;
        if (bot.id === currentBotId) {
            botItem.classList.add('active');
        }
        
        const avatarClass = ['🤖', '📚', '💻', '🔍'].includes(bot.avatar) ? 'custom' : '';
        
        botItem.innerHTML = `
            <div class="bot-item-avatar ${avatarClass}">${bot.avatar}</div>
            <div class="bot-item-info">
                <div class="bot-item-name">${bot.name}</div>
                <div class="bot-item-desc">${bot.description}</div>
            </div>
        `;
        
        botItem.addEventListener('click', () => {
            loadBot(bot.id);
            toggleBotSelector();
        });
        
        botList.appendChild(botItem);
    });
}

function loadBot(botId) {
    currentBotId = botId;
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;
    
    // Update UI
    document.getElementById('current-bot-avatar').textContent = bot.avatar;
    document.getElementById('current-bot-name').textContent = bot.name;
    
    // Set avatar custom class if needed
    const botAvatar = document.getElementById('current-bot-avatar');
    if (['🤖', '📚', '💻', '🔍'].includes(bot.avatar)) {
        botAvatar.classList.add('custom');
    } else {
        botAvatar.classList.remove('custom');
    }
    
    // Update model
    document.getElementById('model-select').value = bot.defaultModel;
    
    // Update file count
    document.getElementById('file-count').textContent = bot.files.length;
    
    // Update active bot in list
    const botItems = document.querySelectorAll('.bot-item');
    botItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.botId === botId) {
            item.classList.add('active');
        }
    });
    
    // Update bot files panel
    renderBotFiles();
    
    // Load or start conversation for this bot
    loadBotConversation(botId);
}

function getModelDisplayName(modelId) {
    const modelMap = {
        'claude-3-opus': 'Claude 3 Opus',
        'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
        'claude-3-7-sonnet': 'Claude 3.7 Sonnet',
        'claude-3-5-haiku': 'Claude 3.5 Haiku',
        'gpt-4o': 'GPT-4o',
        'gpt-4-turbo': 'GPT-4 Turbo'
    };
    return modelMap[modelId] || modelId;
}

function loadBotConversation(botId) {
    // Find if there's an existing conversation for this bot
    let botConversation = conversations.find(c => c.botId === botId);
    
    if (botConversation) {
        // Load existing conversation
        loadConversation(botConversation.id);
    } else {
        // Create a new conversation for this bot
        const newChat = {
            id: Date.now().toString(),
            title: 'New Chat',
            model: bots.find(b => b.id === botId).defaultModel,
            botId: botId,
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        conversations.unshift(newChat);
        saveConversations();
        renderConversationList();
        loadConversation(newChat.id);
    }
}

function toggleBotSelector() {
    const dropdown = document.getElementById('bot-selector-dropdown');
    dropdown.classList.toggle('show');
}

function showCreateBotModal() {
    document.getElementById('create-bot-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('bot-name').value = '';
    document.getElementById('bot-description').value = '';
    document.getElementById('bot-instructions').value = '';
    document.getElementById('bot-default-model').value = 'claude-3-7-sonnet';
    
    // Reset avatar selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('.avatar-option[data-avatar="R"]').classList.add('selected');
}

function closeCreateBotModal() {
    document.getElementById('create-bot-modal').classList.remove('show');
    document.body.style.overflow = '';
}

function createNewBot() {
    const name = document.getElementById('bot-name').value.trim();
    const avatar = document.querySelector('.avatar-option.selected').dataset.avatar;
    const description = document.getElementById('bot-description').value.trim();
    const instructions = document.getElementById('bot-instructions').value.trim();
    const defaultModel = document.getElementById('bot-default-model').value;
    
    if (!name) {
        alert('Please enter a name for your chatbot');
        return;
    }
    
    const newBot = {
        id: 'bot_' + Date.now().toString(),
        name,
        avatar,
        description: description || 'Custom chatbot',
        instructions,
        defaultModel,
        files: []
    };
    
    bots.push(newBot);
    saveBots();
    
    // Update UI
    renderBotList();
    loadBot(newBot.id);
    
    // Close modal
    closeCreateBotModal();
    showNotification('Chatbot created successfully');
}

function getBotContext(bot) {
    let context = '';
    
    // Add bot instructions
    if (bot.instructions) {
        context += `Instructions for ${bot.name}: ${bot.instructions}\n\n`;
    }
    
    // Add file references
    if (bot.files.length > 0) {
        context += 'The bot has access to the following files:\n';
        bot.files.forEach(fileId => {
            const file = uploadedFiles[fileId];
            if (file) {
                context += `- ${file.name} (${formatFileSize(file.size)})\n`;
            }
        });
        context += '\n';
    }
    
    return context;
}

// ==========================================
// File Management
// ==========================================

function toggleBotFilesPanel() {
    const panel = document.getElementById('bot-files-panel');
    panel.classList.toggle('show');
}

function renderBotFiles() {
    const botFilesContent = document.getElementById('bot-files-content');
    const emptyFiles = document.getElementById('empty-files');
    const bot = bots.find(b => b.id === currentBotId);
    
    if (!bot) return;
    
    if (bot.files.length === 0) {
        // Show empty state
        emptyFiles.style.display = 'block';
        botFilesContent.innerHTML = '';
        botFilesContent.appendChild(emptyFiles);
        return;
    }
    
    // Hide empty state and show files
    emptyFiles.style.display = 'none';
    botFilesContent.innerHTML = '';
    
    bot.files.forEach(fileId => {
        const fileData = uploadedFiles[fileId];
        if (!fileData) return;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'bot-file-item';
        
        // Determine file icon based on type
        let fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
        
        if (fileData.type.includes('image')) {
            fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
        } else if (fileData.type.includes('pdf')) {
            fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15h6"></path><path d="M9 11h6"></path></svg>`;
        } else if (fileData.type.includes('spreadsheet') || fileData.name.endsWith('.csv') || fileData.name.endsWith('.xlsx')) {
            fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><line x1="10" y1="9" x2="16" y2="9"></line></svg>`;
        }
        
        fileItem.innerHTML = `
            <div class="bot-file-icon">${fileIcon}</div>
            <div class="bot-file-info">
                <div class="bot-file-name">${fileData.name}</div>
                <div class="bot-file-size">${formatFileSize(fileData.size)}</div>
            </div>
            <div class="bot-file-actions">
                <button class="bot-file-action bot-file-remove" data-file-id="${fileId}" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        
        botFilesContent.appendChild(fileItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.bot-file-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fileId = btn.dataset.fileId;
            removeFileFromBot(fileId);
        });
    });
}

function removeFileFromBot(fileId) {
    const bot = bots.find(b => b.id === currentBotId);
    if (!bot) return;
    
    // Remove file from bot
    bot.files = bot.files.filter(id => id !== fileId);
    saveBots();
    
    // Update UI
    document.getElementById('file-count').textContent = bot.files.length;
    renderBotFiles();
    
    showNotification('File removed from chatbot');
}

function showFileUploadModal() {
    document.getElementById('file-upload-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset the file list
    document.getElementById('upload-file-list').style.display = 'none';
    document.getElementById('upload-file-items').innerHTML = '';
    
    // Reset the file input
    document.getElementById('file-upload-input').value = '';
}

function closeFileUploadModal() {
    document.getElementById('file-upload-modal').classList.remove('show');
    document.body.style.overflow = '';
}

function handleFileSelection(files) {
    const fileList = document.getElementById('upload-file-list');
    const fileItems = document.getElementById('upload-file-items');
    
    if (files.length === 0) {
        fileList.style.display = 'none';
        return;
    }
    
    fileList.style.display = 'block';
    fileItems.innerHTML = '';
    
    // Process each file
    Array.from(files).forEach(file => {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 10MB.`);
            return;
        }
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Determine icon based on file type
        let fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
        
        if (file.type.includes('image')) {
            fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
        } else if (file.type.includes('pdf')) {
            fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15h6"></path><path d="M9 11h6"></path></svg>`;
        } else if (file.type.includes('spreadsheet') || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
            fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><line x1="10" y1="9" x2="16" y2="9"></line></svg>`;
        }
        
        fileItem.innerHTML = `
            <div class="file-item-icon">${fileIcon}</div>
            <div class="file-item-info">
                <div class="file-item-name">${file.name}</div>
                <div class="file-item-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-item-remove" data-name="${file.name}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;
        
        fileItems.appendChild(fileItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.file-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const fileName = btn.dataset.name;
            // Find the file input
            const fileInput = document.getElementById('file-upload-input');
            
            // Create a new FileList without the removed file
            const dt = new DataTransfer();
            Array.from(fileInput.files).forEach(file => {
                if (file.name !== fileName) {
                    dt.items.add(file);
                }
            });
            
            fileInput.files = dt.files;
            
            // Re-render the file list
            handleFileSelection(fileInput.files);
        });
    });
}

function uploadFilesToBot() {
    const fileInput = document.getElementById('file-upload-input');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select at least one file to upload');
        return;
    }
    
    const bot = bots.find(b => b.id === currentBotId);
    if (!bot) return;
    
    // Process each file
    Array.from(files).forEach(file => {
        // Create a file ID
        const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        
        // Add file to uploadedFiles
        uploadedFiles[fileId] = {
            name: file.name,
            type: file.type,
            size: file.size,
            dateAdded: new Date().toISOString()
        };
        
        // Read file content and store it
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedFiles[fileId].content = e.target.result;
            saveFiles();
        };
        reader.readAsDataURL(file);
        
        // Add file ID to bot
        bot.files.push(fileId);
    });
    
    saveBots();
    
    // Update UI
    document.getElementById('file-count').textContent = bot.files.length;
    renderBotFiles();
    
    // Close modal
    closeFileUploadModal();
    showNotification(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`);
}

// ==========================================
// Settings Management
// ==========================================

function loadSettings() {
    const savedSettings = localStorage.getItem('ai-chat-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Fill form values
        document.getElementById('display-name').value = settings.user.name;
        document.getElementById('email').value = settings.user.email;
        
        document.getElementById('notify-new-messages').checked = settings.notifications.newMessages;
        document.getElementById('notify-mentions').checked = settings.notifications.mentions;
        document.getElementById('sound-notifications').checked = settings.notifications.sound;
        
        document.getElementById('dark-mode').checked = settings.appearance.darkMode;
        
        // Set active color
        document.querySelectorAll('.color-option').forEach(option => {
            if (option.dataset.color === settings.appearance.accentColor) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        document.getElementById('font-size').value = settings.appearance.fontSize;
        document.getElementById('compact-mode').checked = settings.appearance.compactMode;
        
        document.getElementById('default-model').value = settings.models.defaultModel;
        document.getElementById('anthropic-key').value = settings.models.apiKeys.anthropic;
        document.getElementById('openai-key').value = settings.models.apiKeys.openai;
        
        document.getElementById('save-conversations').checked = settings.privacy.saveConversations;
        document.getElementById('anonymize-data').checked = settings.privacy.anonymizeData;
        
        document.getElementById('max-tokens').value = settings.advanced.maxTokens;
        document.getElementById('temperature').value = settings.advanced.temperature;
        document.getElementById('streaming').checked = settings.advanced.streaming;
        document.getElementById('debug-mode').checked = settings.advanced.debugMode;
        document.getElementById('show-token-count').checked = settings.advanced.showTokenCount;
        
        // Update UI
        updateUIFromSettings(settings);
    }
}

function updateUIFromSettings(settings) {
    // Update user info
    document.querySelector('.user-name').textContent = settings.user.name;
    document.querySelector('.user-email').textContent = settings.user.email;
    
    // Update appearance
    if (settings.appearance.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    document.documentElement.style.setProperty('--primary-color', settings.appearance.accentColor);
    
    // Apply font size
    const fontSizeClass = `font-size-${settings.appearance.fontSize}`;
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(fontSizeClass);
    
    // Apply compact mode
    if (settings.appearance.compactMode) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }
    
    // Update model selector
    modelSelect.value = settings.models.defaultModel;
}

// ==========================================
// Helper Functions
// ==========================================

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function adjustColorBrightness(hex, percent) {
    hex = hex.replace(/^\s*#|\s*$/g, '');
    
    // Convert to RGB
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    // Adjust brightness
    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));
    
    // Convert back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function showEmptyState() {
    emptyChat.style.display = 'flex';
}

function hideEmptyState() {
    emptyChat.style.display = 'none';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}