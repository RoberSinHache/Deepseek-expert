// Wait for DOM and libraries to load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure marked is loaded and initialize it
    if (typeof marked === 'undefined') {
        console.error('marked.js is not loaded');
        return;
    }

    // Basic marked configuration
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    // Configure highlight.js integration
    const renderer = new marked.Renderer();
    renderer.code = function(code, language) {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        return `<pre><code class="hljs ${validLanguage}">${
            hljs.highlight(code, { language: validLanguage }).value
        }</code></pre>`;
    };

    marked.setOptions({ renderer });

    const chatHistory = document.getElementById('chatHistory');
    const questionInput = document.getElementById('questionInput');
    const sendButton = document.getElementById('sendButton');
    const deepseekExpertBtn = document.getElementById('deepseek-expert-btn');
    const intentDetectorBtn = document.getElementById('intent-detector-btn');

    const chatHistories = {
        'deepseek-expert': [],
        'intent-detector': []
    };

    const initialMessages = {
        'deepseek-expert': "Hi, I´m a chatbot created by Rober. I answer questions related to the next deepseek papers:\n- DeepSeek-R1 Incentivizing Reasoning Capability in LLMs via Reinforcement Learning\n- DeepSeek-V3 Technical Report\n- Scaling Open-Source Language Models with Longtermism\n\nI will try my best to help you, so don´t hesitate to make me questions!",
        'intent-detector': "Hi, I´m a chatbot created by Rober. I´m trained to detect what are the main intents of the messages you send me. \nI´m not perfect, but I´m glad to be challenged!\n\nI can detect the following intents:\n- CheckBalance\n- MoneyTransfer\n- BillPayment\n- ProductInformation\n- Complaint\n- Greeting\n- Goodbye\n- Help\n- Cancellation\n- Confirmation\n\n\nEntities I can also detect:\n- Amounts."
    };

    function initializeChatHistory() {
        Object.keys(chatHistories).forEach(model => {
            if (chatHistories[model].length === 0) {
                chatHistories[model].push({ text: initialMessages[model], type: 'bot' });
            }
        });
    }

    initializeChatHistory();

    function createMessageElement(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} flex gap-4 p-4 mb-4 rounded-xl`;
        
        // Create avatar container
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar shrink-0';
        
        // Add appropriate icon based on message type
        if (type === 'user') {
            /* avatarDiv.innerHTML = '<i class="fas fa-user text-purple-400 text-xl"></i>'; */
        } else if (type === 'bot') {
            avatarDiv.innerHTML = '<div class="bot-message-icon"></div>';
        }

        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content flex-1';
        
        // Parse markdown and sanitize HTML
        try {
            contentDiv.innerHTML = marked.parse(text);
            
            // Initialize syntax highlighting for code blocks
            contentDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
            
            // Make links open in new tab
            contentDiv.querySelectorAll('a').forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
            
            // Add message header
            const messageHeader = document.createElement('div');
            messageHeader.className = 'message-header font-bold';
            messageHeader.innerHTML = type === 'user' ? '<strong>You</strong>' : '<strong>Azure Assistant</strong>';
            contentDiv.insertBefore(messageHeader, contentDiv.firstChild);
        } catch (error) {
            console.error('Error parsing markdown:', error);
            contentDiv.textContent = text;
        }

        // Assemble message
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    function switchChatHistory(model) {
        chatHistory.innerHTML = '';
        chatHistories[model].forEach(message => {
            const messageElement = createMessageElement(message.text, message.type);
            chatHistory.appendChild(messageElement);
        });
    }

    function appendMessage(text, type) {
        const message = { text, type };
        chatHistories[selectedModel].push(message);
        const messageElement = createMessageElement(text, type);
        chatHistory.appendChild(messageElement);
        smoothScrollToBottom();
    }

    function smoothScrollToBottom() {
        chatHistory.scrollTo({
            top: chatHistory.scrollHeight,
            behavior: 'smooth'
        });
    }

    async function sendQuestion() {
        const question = questionInput.value;
        if (!question) return;
        const message = { text: question, type: 'user' };
        
        // Clear the input field immediately
        questionInput.value = '';
        
        appendMessage(message.text, message.type);

        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ question, model: selectedModel })
            });

            const data = await response.json();

            if (!data.answers) {
                throw new Error('No answers found in response');
            }

            appendMessage(data.answers[0].answer, 'bot');
        } catch (error) {
            console.error('Error in sendQuestion:', error);
            appendMessage('Error: ' + error.message, 'bot');
        }
    }

    function extractSource(message) {
        const sourceMatch = message.match(/Source: (.*)/);
        return sourceMatch ? sourceMatch[1] : 'Unknown';
    }

    // Add cursor animation
    const typedSpan = document.querySelector(".global-subtitle");
    const cursorSpan = document.getElementsByClassName("cursor")[0];
    const totype = ["Deepseek Expert"];

    const delayTyping_char = 100;
    const delayErasing_text = 150;
    const delayPrinting_text = 1000;

    let totypeIndex = 0;
    let charIndex = 0;

    function typeText() {
        if (charIndex < totype[totypeIndex].length) {
            typedSpan.textContent += totype[totypeIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeText, delayTyping_char);
        }
        else {
            setTimeout(() => {
                cursorSpan.style.display = 'none';
            }, 1000);
            /* setTimeout(eraseText, delayTyping_text); */
        }
    }

    /* function eraseText() {
        if (charIndex > 0) {
            typedSpan.textContent = totype[totypeIndex].substring(0, charIndex-1);
            charIndex = charIndex-1;
            setTimeout(eraseText, delayErasing_text);
        }
        else {
            totypeIndex++;

            if (totypeIndex >= totype.length)
                totypeIndex = 0;
                setTimeout(typeText, delayPrinting_text);
        }
    } */

    // Custom Cursor Implementation
    const cursor = {
        init: function() {
            // Create cursor elements
            this.cursorContainer = document.createElement('div');
            this.cursorContainer.className = 'custom-cursor';

            this.circle = document.createElement('div');
            this.circle.className = 'cursor-circle';

            this.dot = document.createElement('div');
            this.dot.className = 'cursor-dot';

            // Add to DOM
            this.cursorContainer.appendChild(this.circle);
            this.cursorContainer.appendChild(this.dot);
            document.body.appendChild(this.cursorContainer);

            // Initialize properties
            this.mouseX = 0;
            this.mouseY = 0;
            this.circleX = window.innerWidth / 2;
            this.circleY = window.innerHeight / 2;
            this.speed = 0.15;

            // Bind event listeners
            this.bindEvents();
            // Start animation
            this.animate();
        },

        bindEvents: function() {
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                
                // Update dot position immediately
                this.dot.style.left = `${this.mouseX}px`;
                this.dot.style.top = `${this.mouseY}px`;
            });

            // Add hover effect on interactive elements
            const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    this.circle.classList.add('hover');
                    this.dot.classList.add('hover');
                });
                el.addEventListener('mouseleave', () => {
                    this.circle.classList.remove('hover');
                    this.dot.classList.remove('hover');
                });
            });

            // Handle cursor visibility
            document.addEventListener('mouseleave', () => {
                this.cursorContainer.style.display = 'none';
            });
            document.addEventListener('mouseenter', () => {
                this.cursorContainer.style.display = 'block';
            });
        },

        animate: function() {
            // Smooth follow effect for circle
            this.circleX += (this.mouseX - this.circleX - 16) * this.speed;
            this.circleY += (this.mouseY - this.circleY - 16) * this.speed;
            
            this.circle.style.left = `${this.circleX}px`;
            this.circle.style.top = `${this.circleY}px`;

            requestAnimationFrame(() => this.animate());
        }
    };

    // Initialize cursor and set up event listeners after all elements are defined
    cursor.init();
    
    // Set default model
    let selectedModel = 'deepseek-expert';

    deepseekExpertBtn.addEventListener('click', () => {
        selectedModel = 'deepseek-expert';
        switchChatHistory(selectedModel);
    });

    intentDetectorBtn.addEventListener('click', () => {
        selectedModel = 'intent-detector';
        switchChatHistory(selectedModel);
    });

    switchChatHistory(selectedModel);

    // Set up message input event listeners
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendQuestion();
    });

    sendButton.addEventListener('click', sendQuestion);

    typeText();

    // Gyroscope handling
    /* const chatContainer = document.querySelector('.chat-container');
    let gyroEnabled = false;

    function handleOrientation(event) {
        if (!gyroEnabled || !event.gamma || !event.beta) return;

        // Limit the rotation to a reasonable range
        const maxAngle = 15;
        const gamma = Math.min(Math.max(event.gamma, -maxAngle), maxAngle); // Left/Right tilt
        const beta = Math.min(Math.max(event.beta - 45, -maxAngle), maxAngle); // Front/Back tilt

        // Update CSS custom properties for the rotation
        chatContainer.style.setProperty('--rotateY', `${gamma}deg`);
        chatContainer.style.setProperty('--rotateX', `${-beta}deg`);
    }

    // Request permission for gyroscope on mobile devices
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ devices
        document.body.addEventListener('click', async () => {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    gyroEnabled = true;
                    chatContainer.classList.add('gyro-enabled');
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            } catch (error) {
                console.error('Error requesting gyroscope permission:', error);
            }
        }, { once: true });
    } else if (window.DeviceOrientationEvent) {
        // Other devices with gyroscope
        gyroEnabled = true;
        chatContainer.classList.add('gyro-enabled');
        window.addEventListener('deviceorientation', handleOrientation);
    }

    // Fallback smooth movement for non-gyro devices
    if (!window.DeviceOrientationEvent) {
        chatContainer.addEventListener('mousemove', (e) => {
            const rect = chatContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const maxAngle = 5;
            const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxAngle;
            const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * maxAngle;

            chatContainer.style.setProperty('--rotateY', `${rotateY}deg`);
            chatContainer.style.setProperty('--rotateX', `${-rotateX}deg`);
        });

        chatContainer.addEventListener('mouseleave', () => {
            chatContainer.style.setProperty('--rotateY', '0deg');
            chatContainer.style.setProperty('--rotateX', '0deg');
        });
    } */
});