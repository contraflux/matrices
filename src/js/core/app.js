import { GridContainer} from "../components/Container.js"

import { Matrix } from "../components/Matrix.js";
import { Vector } from "../components/Vector.js";

import { pixelsToCoords, coordsToPixels, hexToRGB } from "../util/conversions.js";
import { log, colorLerp } from "../util/utilities.js";
import { rainbow, highlight, light, dark } from "../util/colors.js";

export const gridContainer = new GridContainer('canvas');
export const dt = 1e-2;

const canvas = gridContainer.canvas;
const ctx = gridContainer.ctx;

const a11_input = document.getElementById('a11');
const a12_input = document.getElementById('a12');
const a21_input = document.getElementById('a21');
const a22_input = document.getElementById('a22');
const invert_input = document.getElementById('invert');
const transpose_input = document.getElementById('transpose');
const rank_output = document.getElementById('rank');
const trace_output = document.getElementById('trace');
const determinant_output = document.getElementById('determinant');
const polynomial_output = document.getElementById('characteristic-polynomial');
const eigval_1_output = document.getElementById('eigenvalue-1');
const eigval_2_output = document.getElementById('eigenvalue-2');
const eigvec_1_output = document.getElementById('eigenvector-1');
const eigvec_2_output = document.getElementById('eigenvector-2');

function drawGrid(v1, v2, color, width) {
    const upperLeftBound = pixelsToCoords(0, 0);
    const lowerRightBound = pixelsToCoords(canvas.width, canvas.height);

    const gridSpacing = Math.pow(5, Math.ceil(log(50 / gridContainer.coordScale, 5)));

    const [x_max, y_min] = lowerRightBound;
    const [x_min, y_max] = upperLeftBound;

    const M = new Matrix(v1.x, v2.x, v1.y, v2.y);
    const m1 = new Vector(Math.floor(x_max / gridSpacing) * gridSpacing, Math.floor(y_min / gridSpacing) * gridSpacing);
    const m2 = new Vector(Math.floor(x_min / gridSpacing) * gridSpacing, Math.floor(y_max / gridSpacing) * gridSpacing);

    const M_inv = M.getInverse();
    const w1 = M_inv.multiply(m1);
    const w2 = M_inv.multiply(m2);

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.font = "18px serif";

    const x_min_bound = Math.floor(Math.min(w1.x, w2.x) / gridSpacing) * gridSpacing;
    const x_max_bound = Math.max(w1.x, w2.x);
    const y_min_bound = Math.floor(Math.min(w1.y, w2.y) / gridSpacing) * gridSpacing;
    const y_max_bound = Math.max(w1.y, w2.y);

    for (let x = x_min_bound - gridSpacing; x <= x_max_bound; x += gridSpacing) {
        for (let y = y_min_bound - gridSpacing; y <= y_max_bound; y += gridSpacing) {
            const u = new Vector(x, y);
            const v = M.multiply(u);
            
            ctx.save();
            ctx.translate(...coordsToPixels(v.x, v.y))
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(v1.x * gridContainer.coordScale * gridSpacing, -v1.y * gridContainer.coordScale * gridSpacing);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(v2.x * gridContainer.coordScale * gridSpacing, -v2.y * gridContainer.coordScale * gridSpacing);
            ctx.stroke();

            if (x == 0) {
                ctx.fillText(y, 10, 10);
            } else if (y == 0) {
                ctx.fillText(x, 10, 10);
            }

            ctx.restore();
        }
    }
}

function drawVector(v, color, width) {
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
}

function appPeriodic() {
    gridContainer.matrix.a11 = parseFloat(a11_input.value);
    gridContainer.matrix.a12 = parseFloat(a12_input.value);
    gridContainer.matrix.a21 = parseFloat(a21_input.value);
    gridContainer.matrix.a22 = parseFloat(a22_input.value);

    updateProperties();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = light;
    ctx.strokeStyle = light;
    ctx.font = "12px serif";

    const e1 = new Vector(1, 0);
    const e2 = new Vector(0, 1);

    const v1 = gridContainer.matrix.multiply(e1);
    const v2 = gridContainer.matrix.multiply(e2);

    drawGrid(e1, e2, "white", 0.5);
    drawGrid(v1, v2, "blue", 1);

    drawVector(e1, "white", 2.5);
    drawVector(e2, "white", 2.5);

    drawVector(v1, "blue", 5);
    drawVector(v2, "blue", 5);

}

function updateValues() {
    a11_input.value = gridContainer.matrix.a11;
    a12_input.value = gridContainer.matrix.a12;
    a21_input.value = gridContainer.matrix.a21;
    a22_input.value = gridContainer.matrix.a22;
}

function updateProperties() {
    const [eigval_1, eigval_2] = gridContainer.matrix.eigenvalues();

    rank_output.innerHTML = gridContainer.matrix.rank();
    trace_output.innerHTML = gridContainer.matrix.trace();
    determinant_output.innerHTML = gridContainer.matrix.determinant();
    polynomial_output.innerHTML = gridContainer.matrix.characteristicPolynomial();
    eigval_1_output.innerHTML = eigval_1;
    eigval_2_output.innerHTML = eigval_2;
    const [x1, x2] = gridContainer.matrix.eigenvector(eigval_1);
    const [y1, y2] = gridContainer.matrix.eigenvector(eigval_2);
    eigvec_1_output.innerHTML = "[" + x1 + ", " + x2 + "]";
    eigvec_2_output.innerHTML = "[" + y1 + ", " + y2 + "]";
}

canvas.addEventListener('mousedown', (e) => { gridContainer.isDragging = true; });
canvas.addEventListener('mousemove', (e) => gridContainer.dragGrid(e));
canvas.addEventListener('mouseup', () => { gridContainer.isDragging = false; })
canvas.addEventListener('wheel', (e) => gridContainer.zoomGrid(e));

invert_input.addEventListener('click', () => {
    gridContainer.matrix.invert();
    updateValues();
});
transpose_input.addEventListener('click', () => {
    gridContainer.matrix.transpose();
    updateValues();
});

document.addEventListener('keypress', (e) => {
    if (e.key == 'r') gridContainer.resetFields();
});

setInterval(appPeriodic, 10);