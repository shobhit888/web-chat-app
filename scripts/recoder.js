class Recorder {

    constructor() {
        this._recorder = null;
        this._audioChunks = [];

        this.init();
    }

    
    init() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({audio: true}, (stream) => {

                this._recorder = new MediaRecorder(stream);

                
                this._recorder.addEventListener("dataavailable", (e) => {
                    this._audioChunks.push(e.data)
                });

            }, () => {
                throw new Error("Use Media not found.")
            });
        } else {
            throw new Error("Use Media not found.")
        }
    }

    
    start() {
        if (!this._recorder)
            return;

        this._audioChunks = [];
        this._recorder.start();
    }

    
    stop() {
        return new Promise((resolve) => {

            this._recorder.addEventListener("stop", async () => {

               
                const audioBlob = new Blob(this._audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                this._audio = new Audio(audioUrl);

                const duration = await this.findDuration(audioBlob);

                resolve({audio: this._audio, duration, audioUrl})
            });

            this._recorder.stop();
        })
    }

    findDuration(blob) {
        return new Promise((resolve) => {
            const file = new File([blob], "audio.mp3");
            let reader = new FileReader();
            reader.onload = (e) => {
                let audioContext = new (window.AudioContext || window.webkitAudioContext)();

               
                audioContext.decodeAudioData(e.target.result, function (buffer) {
                    let floatDuration = buffer.duration;

                    let dMin = Math.floor(floatDuration / 60);
                    let dSec = Math.floor(floatDuration % 60);

                    if (dMin < 10)
                        dMin = "0" + dMin;

                    if (dSec < 10)
                        dSec = "0" + dSec;

                    resolve(`${dMin}:${dSec}`)
                });
            };

            reader.readAsArrayBuffer(file);
        })
    }

    
    get audio() {
        return this._audio;
    }

    
    static isMicAvailable() {
        let isAvailable = true;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({audio: true}, (stream) => {
                isAvailable = true;
            }, () => {
                isAvailable = false;
            });
        }

        return isAvailable;
    }
    static secToTimeStr(seconds) {
        let timeInHour = Math.floor(seconds / 3600);
        let timeInMin = Math.floor((seconds % 3600) / 60);
        let timeInSec = Math.floor(seconds % 60);

        if (timeInHour < 10)
            timeInHour = `0${timeInHour}`;

        if (timeInMin < 10)
            timeInMin = `0${timeInMin}`;

        if (timeInSec < 10)
            timeInSec = `0${timeInSec}`;

        let timeStr = `${timeInMin}:${timeInSec}`;
        if (parseInt(timeInHour))
            timeStr = `${timeInHour}:${timeStr}`;

        return timeStr;
    }

}
