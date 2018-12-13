if (typeof OffscreenCanvas !== 'undefined') {
    self.document = {
        createElement: () => {
            return new OffscreenCanvas(640, 480);
        },
    };
    self.window = {
        screen: {
            width: 640,
            height: 480,
        },
    };
    self.HTMLVideoElement = function () {
    };
    self.HTMLImageElement = function () {
    };
    self.HTMLCanvasElement = function () {
    };
}

import * as tfc from '@tensorflow/tfjs-core';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

let pathName = location.pathname;
let path = pathName.split('/').splice(0,-1).join('/');
// bodyPix.checkpoints['0.75'].url = `${location.origin}${path}/assets/model_75/`;
bodyPix.checkpoints['0.25'].url = `${location.origin}${path}/assets/model_25/`;

let net;
let videoElm;
let hasLoad = false;
let flipHorizontal = false,
    outputStride = 16,
    segmentationThreshold = 0.5;

async function loadModel() {
    net = await bodyPix.load(0.25);
    // net = await bodyPix.load(0.5);
    return net;
}

loadModel().then(e => {
    // console.log(e);
    self.onmessage = async (e) => {
        let imageData = e.data.data;
        let time = +new Date();
        let segmentation = await net.estimatePersonSegmentation(
            imageData, flipHorizontal, outputStride, segmentationThreshold,
        );
        // console.log(+new Date() - time);
        self.postMessage({type: 'segmentation', data: segmentation});
    };
    self.postMessage({type: 'loaded'});
});
