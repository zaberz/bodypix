// import * as tf from '@tensorflow/tfjs';
import Stats from 'stats.js';
import Render from './render';
let tf = window.tf
// window.tf = tf;
let stats = new Stats();
stats.showPanel(1);
document.body.appendChild(stats.dom);

const videoElm = document.getElementById('video');
const canvas = document.getElementById('canvas');

const RTCElm = document.getElementById('rtc-video');

const videoButton = document.getElementById('btn-video');
const RTCButton = document.getElementById('btn-rtc');

document.getElementById('btn-video').addEventListener('click', (e) => {
    videoElm.play();
    render.setVideo(videoElm);
});

document.getElementById('btn-rtc').addEventListener('click', async (e) => {
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    function isiOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function isMobile() {
        return isAndroid() || isiOS();
    }

    const mobile = isMobile();

    // const videoWidth = 480;
    const videoWidth = 640;
    const videoHeight = 480;
    // const videoHeight = 640;

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            width: mobile ? undefined : videoWidth,
            height: mobile ? undefined : videoHeight,
        },
    });

    RTCElm.srcObject = stream;

    RTCElm.onloadedmetadata = (e) => {
        RTCElm.width = videoWidth;
        RTCElm.height = videoHeight;
        render.setVideo(RTCElm);
    };
});

Array.from(document.getElementsByName('worker')).map(elm => {
    elm.addEventListener('change', (e) => {
        let isUseWorker = elm.value;
        render.setWorkerType(isUseWorker);
    });
});

Array.from(document.getElementsByName('multiplier')).map(elm => {
    elm.addEventListener('change', e => {
        let multiplier = elm.value;
        render.setMultiplier(multiplier);
    });
});

document.getElementById('segmetation-treshold').addEventListener('change', function (e) {
    let value = parseFloat(this.value);
    if (!value || value > 1 || value < 0) {
        alert('阙值必须为0~1的数字');
        return;
    }
    render.setTreshold(value);
});

const danmuInput = document.getElementById('danmu-input');
document.getElementById('btn-add').addEventListener('click', e => {
    let text = danmuInput.value;
    if (text) {
        render.addDanmu(text.toString());
    }
});

// modelWorker.onmessage = function (e) {
// console.log('main ' + e);
// };
let render
let hasInit = false
videoElm.addEventListener('canplay', ()=> {
    if (!hasInit) {
        hasInit = true
        render = new Render(videoElm, canvas);
        render.addDanmu('帅帅帅帅帅帅帅帅帅帅帅帅帅帅帅帅帅帅帅帅帅');
        render.loadModel(0.25).then(e => {
            return renderCanvas();
        });
    }
})

// render.initWorker();

async function renderCanvas() {
    stats.begin();
    await render.draw();
    // modelWorker.postMessage({type: 'addVideo', data: tf.fromPixels(videoElm)});
    stats.end();
    requestAnimationFrame(renderCanvas);
}
