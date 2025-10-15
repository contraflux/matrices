/**
 * plotting
 * 
 * Functions for drawing grid and vectors
 * 
 * @author contraflux
 * @date 10/10/2025
 */

import { Matrix } from "../components/Matrix.js";
import { Vector } from "../components/Vector.js";
import { pixelsToCoords, log, coordsToPixels, } from './utilities.js';

/**
 * Draws a scaled coordinate grid with major and minor gridlines from two
 * basis vectors
 *
 * @param {GridContainer} gridContainer - The app container
 * @param {Vector} v1 - The first basis vector
 * @param {Vector} v2 - The second basis vector
 * @param {string} color - The color of the grid
 * @param {float} width - The width of the grid lines
 */
export function drawGrid(gridContainer, v1, v2, color, width) {
    const ctx = gridContainer.ctx;
    const lowerLeftBound = pixelsToCoords(0, canvas.height);
    const upperRightBound = pixelsToCoords(canvas.width, 0);

    const threshold = 5
    const gridSpacing = Math.pow(threshold, Math.ceil(log(50 / gridContainer.coordScale, threshold)));

    const [x_min, y_min] = lowerLeftBound;
    const [x_max, y_max] = upperRightBound;

    const M = new Matrix(v1.x, v2.x, v1.y, v2.y);
    const b1 = new Vector(x_min, y_min);
    const b2 = new Vector(x_min, y_max);
    const b3 = new Vector(x_max, y_min);
    const b4 = new Vector(x_max, y_max);

    const M_inv = M.getInverse();
    const w1 = M_inv.multiply(b1);
    const w2 = M_inv.multiply(b2);
    const w3 = M_inv.multiply(b3);
    const w4 = M_inv.multiply(b4);

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.font = "18px serif";

    const xs = [w1.x, w2.x, w3.x, w4.x];
    const ys = [w1.y, w2.y, w3.y, w4.y];

    for (let x = Math.floor(Math.min(...xs) / gridSpacing) * gridSpacing; x <= Math.max(...xs); x += gridSpacing) {
        for (let y = Math.floor(Math.min(...ys) / gridSpacing) * gridSpacing; y <= Math.max(...ys); y += gridSpacing) {
            const position = M.multiply(new Vector(x, y));

            ctx.save();
            ctx.translate(...coordsToPixels(position.x, position.y));
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(v1.x * gridContainer.coordScale * gridSpacing, -v1.y * gridContainer.coordScale * gridSpacing)
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(v2.x * gridContainer.coordScale * gridSpacing, -v2.y * gridContainer.coordScale * gridSpacing)
            ctx.stroke();

            if (x == 0) {
                ctx.fillText(y.toFixed(0), 5, 20);
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2)
                ctx.fill();
            } else if (y == 0) {
                ctx.fillText(x.toFixed(0), 5, 20);
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2)
                ctx.fill();
            }

            ctx.restore();
        }
    }
}

/**
 * Draws a vector
 *
 * @param {GridContainer} gridContainer - The app container
 * @param {Vector} v - The vector to be drawin
 * @param {string} color - The color of the grid
 * @param {float} width - The width of the vector line
 * @param {boolean} drawArrow - Whether to draw the arrow tip or not
 */
export function drawVector(gridContainer, v, color, width, drawArrow) {
    const ctx = gridContainer.ctx;
    const [w_0, h_0] = coordsToPixels(0, 0);
    const [w, h] = coordsToPixels(...v.asArray());
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.font = "18px serif";
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(w_0, h_0);
    ctx.lineTo(w, h);
    ctx.stroke();
    ctx.restore();

    if (drawArrow) {
        ctx.save();
        ctx.translate(w, h);
        ctx.rotate(Math.atan2(v.x, v.y) + Math.PI);
        ctx.moveTo(-5, -5);
        ctx.lineTo(0, 0);
        ctx.lineTo(5, -5);
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * Shades in the area swept out by two vectors
 *
 * @param {GridContainer} gridContainer - The app container
 * @param {Vector} v1 - The first vector
 * @param {Vector} v2 - The second vector
 * @param {string} color - The color of the polygon
 * @param {float} alpha - The transparency of the polygon
 */
export function drawArea(gridContainer, v1, v2, color, alpha) {
    const ctx = gridContainer.ctx;

    const p1 = coordsToPixels(0, 0);
    const p2 = coordsToPixels(v1.x, v1.y);
    const p3 = coordsToPixels(v1.x + v2.x, v1.y + v2.y);
    const p4 = coordsToPixels(v2.x, v2.y);

    ctx.globalAlpha = 0.5;

    ctx.fillStyle = color;
    ctx.font = "18px serif";
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.fill();
    ctx.restore();
    
    ctx.globalAlpha = 1;
}