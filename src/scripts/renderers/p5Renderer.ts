import * as seedrandom from 'seedrandom';
import { BaseRenderer } from './baseRenderer';
import gsap from 'gsap';
import P5 from 'p5';
import jsfeat from 'jsfeat';

const srandom = seedrandom('b');

let buffer;
let result;

export default class P5Renderer implements BaseRenderer{

    recording: boolean = false;
    colors = ['#D1CDC4', '#340352', '#732A70', '#FF6EA7', '#FFE15F'];
    backgroundColor = '#FFFFFF';

    canvas: HTMLCanvasElement;
    s: any;

    completeCallback: any;
    delta = 0;
    animating = true;

    width: number = 1920 / 2;
    height: number = 1080 / 2;

    size: number;

    x: number;
    y: number;

    frameCount = 0;
    totalFrames = 1000;

    capture;

    constructor(w, h) {

        this.width = w;
        this.height = h;

        const sketch = (s) => {
            this.s = s;
            s.pixelDensity(1);
            s.setup = () => this.setup(s)
            s.draw = () => this.draw(s)
        }

        new P5(sketch);
    }

    protected setup(s) {
        let renderer = s.createCanvas(this.width, this.height);
        this.canvas = renderer.canvas;

        this.capture = s.createCapture(s.VIDEO);
        this.capture.size(this.width, this.height);
        this.capture.hide();
        
        buffer = new jsfeat.matrix_t(this.width, this.height, jsfeat.U8C1_t);

        s.background(0);

    }

    protected draw(s) {
        if (this.animating) { 
            this.frameCount += 3;

            let frameDelta = 2 * Math.PI * (this.frameCount % this.totalFrames) / this.totalFrames;

            //s.colorMode(s.RGB);
            //s.colorMode(s.HSB);

            /*
            s.image(this.capture, 0, 0, 320, 240);
            s.filter(s.THRESHOLD);
            */
            s.image(this.capture, 0, 0, this.width, this.height);
            
            
            s.loadPixels();
            if (s.pixels.length > 0) { // don't forget this!
                var blurSize = 50;//select('#blurSize').elt.value;
                var lowThreshold = 100;//select('#lowThreshold').elt.value;
                var highThreshold = 50;//select('#highThreshold').elt.value;
        
                blurSize = s.map(blurSize, 0, 100, 1, 12);
                lowThreshold = s.map(lowThreshold, 0, 100, 0, 255);
                highThreshold = s.map(highThreshold, 0, 100, 0, 255);
        
                jsfeat.imgproc.grayscale(s.pixels, this.width, this.height, buffer);
                jsfeat.imgproc.gaussian_blur(buffer, buffer, blurSize, 0);
                jsfeat.imgproc.canny(buffer, buffer, lowThreshold, highThreshold);
                var n = buffer.rows * buffer.cols;
                // uncomment the following lines to invert the image
        //        for (var i = 0; i < n; i++) {
        //            buffer.data[i] = 255 - buffer.data[i];
        //        }
                result = this.jsfeatToP5(buffer, result, s);
                s.image(result, 0, 0, this.width, this.height);
            }
            
            
            if (this.recording) {
                if (frameDelta == 0) {
                    this.completeCallback();
                }
            }
        }
    }
    
    private jsfeatToP5(src, dst, s) {
        if (!dst || dst.width != src.cols || dst.height != src.rows) {
            dst = s.createImage(src.cols, src.rows);
        }
        var n = src.data.length;
        dst.loadPixels();
        var srcData = src.data;
        var dstData = dst.pixels;
        for (var i = 0, j = 0; i < n; i++) {
            var cur = srcData[i];
            dstData[j++] = cur;
            dstData[j++] = cur;
            dstData[j++] = cur;
            dstData[j++] = 255;
        }
        dst.updatePixels();
        return dst;
    }
    

    public render() {

    }

    public play() {
        this.frameCount = 0;
        this.recording = true;
        this.animating = true;
        this.s.background(0, 0, 0, 255);
    }

    public stop() {
        this.animating = false;
    }

    public setCompleteCallback(completeCallback: any) {
        this.completeCallback = completeCallback;
    }

    public resize() {
        this.s.resizeCanvas(window.innerWidth, window.innerHeight);
        this.s.background(0, 0, 0, 255);
    }
}