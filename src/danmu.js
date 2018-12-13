export default class Danmu {
    constructor(width, height) {
        this.danmus = [];
        this.mask = null;
        let canvas = this.canvas = document.createElement('canvas');
        this.width = canvas.width = width;
        this.height = canvas.height = height;
        this.ctx = canvas.getContext('2d');

        this.defaultStyle = {
            fontSize: 100,
            fillStyle: '#ffffff',
            speed: 200,
            x: this.width,
            y: this.height / 2,
        };

        this.lastUpdateTime = 0;
    }

    add(text, style = {}) {
        style = Object.assign({}, this.defaultStyle, style);
        this.danmus.push({text, style});
    }

    _update(dt) {
        if (this.danmus.length === 0) {
            return;
        }

        let ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        this.danmus.map(danmu => {
            let {text, style} = danmu;
            if (style.x === undefined || style.y === undefined) {
                style.x = this.width;
                style.y = Math.random() * this.height;
            } else {
                style.x -= dt * style.speed;
            }

            ctx.save();
            ctx.font = `${style.fontSize}px Arial`;
            ctx.fillStyle = style.fillStyle;
            ctx.fillText(text, style.x, style.y);

            let textWidth = ctx.measureText(text).width;
            ctx.restore();

            if (textWidth < -style.x) {
                style.x = this.width;
                style.y = Math.random() * this.height;
            }
        });

    }

    setMask(mask) {
        this.mask = mask;
    }

    getCanvasWithMask(mask = this.mask) {
        if (this.danmus.length === 0 || !mask) {
            return this.canvas;
        }
        let {width, height} = this;
        if (mask.width !== width || mask.height !== height) {
            // throw new Error('got wrong mask');
            console.error('got wrong mask');
            return this.canvas;
        }

        const maskData = mask.data;
        const danmuPixData = this._getImageData();
        for (let i = 0; i < width * height; i++) {
            let alpha = maskData[i];
            if (alpha === 1) {
                danmuPixData.data[i * 4 + 3] = 0;
            }
        }
        this.ctx.putImageData(danmuPixData, 0, 0);
        return this.canvas;
    }

    _getImageData(dt = this._getDeltaTime()) {
        this._update(dt);
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }

    _getDeltaTime() {
        let lastUpdateTime = this.lastUpdateTime;
        if (!lastUpdateTime) {
            this.lastUpdateTime = +new Date();
            return 0;
        }
        let now = this.lastUpdateTime = +new Date();
        return (now - lastUpdateTime) / 1000;
    }

    updateSize(width, height) {
        let canvas = this.canvas = document.createElement('canvas');
        this.width = canvas.width = width;
        this.height = canvas.height = height;
        this.ctx = canvas.getContext('2d');
    }

}