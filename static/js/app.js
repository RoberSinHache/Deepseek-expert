// static/js/app.js
const chatHistory = document.getElementById('chatHistory');
const questionInput = document.getElementById('questionInput');

function appendMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} flex gap-4 p-4 mb-4 rounded-xl`;
    
    const icon = type === 'user' ? 
        '<i class="fas fa-user text-purple-400 text-xl"></i>' :
        '<div class="bot-message-icon"></div>';
    
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="shrink-0">${icon}</div>
        <div class="flex-1">
            <div class="message-header font-bold ${type === 'user' ? 'text-purple-400' : 'text-cyan-400'}">
                ${type === 'user' ? 'Tú' : 'Asistente Azure'}
            </div>
            <div class="message-content opacity-90">${formattedMessage}</div>
            ${type === 'bot' ? '<div class="mt-2 text-xs opacity-70">Fuente: ' + extractSource(message) + '</div>' : ''}
        </div>
    `;
    
    chatHistory.appendChild(messageDiv);
    smoothScrollToBottom();
}

function smoothScrollToBottom() {
    chatHistory.scrollTo({
        top: chatHistory.scrollHeight,
        behavior: 'smooth'
    });
}

async function sendQuestion() {
    const question = questionInput.value.trim();
    if (!question) return;
    
    appendMessage(question, 'user');
    questionInput.value = '';
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-dots text-center py-4 text-gray-400';
    loadingDiv.textContent = 'Procesando';
    chatHistory.appendChild(loadingDiv);
    smoothScrollToBottom();
    
    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ question })
        });
        
        const data = await response.json();
        chatHistory.removeChild(loadingDiv);
        
        if (data.answers.length > 0) {
            data.answers.forEach((answer, index) => {
                setTimeout(() => {
                    const answerText = `${answer.answer}\nConfianza: ${(answer.confidence * 100).toFixed(2)}%`;
                    appendMessage(answerText, 'bot');
                }, index * 300);
            });
        } else {
            appendMessage('No encontré una respuesta adecuada.', 'bot');
        }
        
    } catch (error) {
        appendMessage(`Error: ${error.message}`, 'error');
    }
}

function extractSource(message) {
    const sourceMatch = message.match(/Fuente: (.*)/);
    return sourceMatch ? sourceMatch[1] : 'Desconocida';
}

// Manejar Enter key
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendQuestion();
});


// Add cursor animation
const typedSpan = document.getElementById("typed")
const cursorSpan = document.getElementsByClassName("cursor")[0]
const totype = ["Tu colega Juan"]

const delayTyping_char = 100;
const delayErasing_text = 150;
const delayTyping_text = 500;

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

function eraseText() {
	if (charIndex > 0) {
		typedSpan.textContent = totype[totypeIndex].substring(0, charIndex-1);
		charIndex = charIndex-1;
		setTimeout(eraseText, delayErasing_text);
	}
	else {
		totypeIndex++;

		if (totypeIndex >= totype.length)
			totypeIndex = 0;
			setTimeout(typeText, delayTyping_text);
	}
}

window.onload = function() {
	typeText();
    /* if (totype[totypeIndex].length) setTimeout(typeText, delayTyping_text); */
}


let mouseX = 0, mouseY = 0;
let circleX = window.innerWidth / 2; // Inicializar en centro
let circleY = window.innerHeight / 2;

const cursorContainer = document.createElement('div');
cursorContainer.className = 'custom-cursor';
cursorContainer.style.display = 'block'; // Ensure visibility

const cursorCircle = document.createElement('div');
cursorCircle.className = 'cursor-circle';

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';

cursorContainer.appendChild(cursorCircle);
cursorContainer.appendChild(cursorDot);
document.body.appendChild(cursorContainer);

// Actualizar posición del cursor
document.addEventListener('mousemove', (e) => {
    // Update cursor immediately
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    
    // Store position for delayed circle
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animate() {
    // Smooth delayed movement for circle
    const lerpSpeed = 0.1;
    circleX += (mouseX - circleX) * lerpSpeed;
    circleY += (mouseY - circleY) * lerpSpeed;
    
    cursorCircle.style.left = `${circleX}px`;
    cursorCircle.style.top = `${circleY}px`;
    
    requestAnimationFrame(animate);
}

animate();

// Update positions on window resize
window.addEventListener('resize', () => {
    circleX = window.innerWidth / 2;
    circleY = window.innerHeight / 2;
});

// Efectos de interacción
document.addEventListener('mousedown', () => {
    cursorCircle.style.transform = 'scale(0.8)';
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
});

document.addEventListener('mouseup', () => {
    cursorCircle.style.transform = 'scale(1)';
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
});

// Visibilidad del cursor
document.addEventListener('mouseleave', () => {
    cursorContainer.style.opacity = '0';
    cursorContainer.style.transition = 'opacity 0.3s';
});

document.addEventListener('mouseenter', () => {
    cursorContainer.style.opacity = '1';
});