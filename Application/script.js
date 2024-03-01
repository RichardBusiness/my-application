document.addEventListener('DOMContentLoaded', function () {
    const passwordForm = document.getElementById('passwordForm');
    const audioRecorder = document.getElementById('audioRecorder');
    const recordButton = document.getElementById('recordButton');
    const micImage = document.getElementById('micImage');
    const loader = document.getElementById('loader');
    const passwordInput = document.getElementById('passwordInput');

    let isRecording = false;
    let mediaRecorder;
    let chunks = [];

    document.getElementById('togglePassword').addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'Show Password' : 'Hide Password';
    });

    document.getElementById('passwordSubmit').addEventListener('click', function () {
        const password = passwordInput.value.trim();
        if (password === 'Project') {
            passwordForm.style.display = 'none';
            audioRecorder.style.display = 'block';
        } else {
            alert('Incorrect password. Please try again.');
        }
    });

    recordButton.addEventListener('click', toggleRecording);

    function toggleRecording() {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    }

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                isRecording = true;
                loader.style.display = 'block';
                micImage.classList.add('recording');
                document.title = "Recording...";
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = function (event) {
                    chunks.push(event.data);
                    
                    websocket.send(event.data);
                };
                mediaRecorder.onstop = function () {
                    isRecording = false;
                    loader.style.display = 'none';
                    micImage.classList.remove('recording');
                    document.title = "Website";
                    saveRecording();
                    
                    websocket.send('audio_finished');
                };
                mediaRecorder.start();
            })
            .catch(function (err) {
                console.error('Error accessing microphone: ', err);
                alert('Error accessing microphone. Please try again later.');
            });
    }

    function stopRecording() {
        mediaRecorder.stop();
    }

    function saveRecording() {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const randomFileName = generateName(10) + '.wav'; 
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = randomFileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        chunks = [];
    }

    function generateName(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

 
    const websocket = new WebSocket('ws://localhost:8765');
});
