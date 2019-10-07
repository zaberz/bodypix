// import * as bodyPix from '@tensorflow-models/body-pix';
import Danmu from './danmu';
import * as _ from 'lodash';
import ModelWorker from 'worker-loader!./modelWorker';
let bodyPix = window.bodyPix
console.log(bodyPix);
bodyPix.checkpoints['1'].url = `${location.origin}${location.pathname}/assets/model_100/`;
bodyPix.checkpoints['0.75'].url = `${location.origin}${location.pathname}/assets/model_75/`;
bodyPix.checkpoints['0.5'].url = `${location.origin}${location.pathname}/assets/model_50/`;
bodyPix.checkpoints['0.25'].url = `${location.origin}${location.pathname}/assets/model_25/`;
let net = null
export default class Render {
    constructor(video, canvas) {
        this.videoElm = video;
        this.canvas = canvas;
        this.width = canvas.width = video.width = video.videoWidth;
        this.height = canvas.height = video.height = video.videoHeight;
        this.ctx = canvas.getContext('2d');
        this.net = null;
        this.danmu = new Danmu(this.width, this.height);
        this.flipHorizontal = false;
        this.outputStride = 16;
        this.segmentationThreshold = 0.5;
        this.b = _.throttle(this._getBodySegmentationAndSet.bind(this), 30);
        this.isUseWorker = false;
    }

    async loadModel(multiplier = 0.75) {
        net = this.net = await bodyPix.load(multiplier);
        return this.net;
    }

    addDanmu(text) {
        this.danmu.add(text);
    }

    draw() {
        if (this.isUseWorker) {
            this._drawWithWorker();
        } else {
            this._drawWithGPU();
        }
    }

    async _getBodySegmentation() {
        let {videoElm, flipHorizontal, outputStride, segmentationThreshold} = this;
        let bodySegmentation = await net.estimatePersonSegmentation(
            videoElm, flipHorizontal, outputStride, segmentationThreshold,
        );
        return bodySegmentation;
    }

    async _getBodySegmentationAndSet() {
        let bodySegmentation = await this._getBodySegmentation()
        this.danmu.setMask(bodySegmentation);
    }

    _drawWithGPU() {
        let {ctx, width, height, videoElm, danmu} = this;
        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(videoElm, 0, 0);

        ctx.globalCompositeOperation = 'source-over';

        this.b();

        let danmuCanvas = danmu.getCanvasWithMask();

        ctx.drawImage(danmuCanvas, 0, 0);
    }

    _drawWithWorker() {
        let {ctx, videoWidth, videoHeight, videoElm, danmu} = this;
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        ctx.drawImage(videoElm, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        let danmuCanvas = danmu.getCanvasWithMask();
        ctx.drawImage(danmuCanvas, 0, 0);
    }

    initWorker() {
        if (this.webWorker) {
            this.destroyWorker();
        }
        let modelWorker = this.webWorker = new ModelWorker();
        modelWorker.onmessage = (e) => {
            if (e.data.type === 'segmentation') {
                let segmentation = e.data.data;
                this.danmu.setMask(segmentation);
            }
            let imageData = this.ctx.getImageData(0, 0, this.width, this.height);

            modelWorker.postMessage({
                type: '', data: imageData,
            });
        };
    }

    destroyWorker() {
        this.webWorker.terminate();
    }

    setWorkerType(type = 1) {
        // 1 使用， 0 不使用
        type = parseInt(type);
        if (type) {
            this.isUseWorker = true;
            this.initWorker();
        } else {
            this.isUseWorker = false;
            this.destroyWorker();
        }
    }

    setTreshold(threshold) {
        this.segmentationThreshold = parseFloat(threshold);
    }

    setMultiplier(multiplier) {
        this.loadModel(parseFloat(multiplier));
    }

    setVideo(videoElm) {
        this.videoElm = videoElm;
        let canvas = this.canvas;
        console.log(videoElm.width);
        canvas.width = videoElm.width;
        canvas.height = videoElm.height;

        this.width = videoElm.width;
        this.height = videoElm.height;
        this.danmu.updateSize(videoElm.width, videoElm.height);
    }

}
