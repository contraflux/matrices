/**
 * app
 * 
 * Main script for the app, contains evaluation of user input, calling of draw
 * functions for the scalar fields, vector fields, and charges, periodic function
 * and event listeners
 * 
 * @author contraflux
 * @date 10/10/2025
 */

import { GridContainer} from "./components/Container.js"
import { Vector } from "./components/Vector.js";
import { light } from "./util/utilities.js";
import { drawGrid, drawVector } from "./util/plotting.js"

export const gridContainer = new GridContainer('canvas');

const canvas = gridContainer.canvas;
const ctx = gridContainer.ctx;

const a11_input = document.getElementById('a11');
const a12_input = document.getElementById('a12');
const a21_input = document.getElementById('a21');
const a22_input = document.getElementById('a22');

const e11_input = document.getElementById('e11');
const e12_input = document.getElementById('e12');
const e21_input = document.getElementById('e21');
const e22_input = document.getElementById('e22');

const v1_input = document.getElementById('v1');
const v2_input = document.getElementById('v2');

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

function appPeriodic() {
    gridContainer.matrix.a11 = parseFloat(a11_input.value);
    gridContainer.matrix.a12 = parseFloat(a12_input.value);
    gridContainer.matrix.a21 = parseFloat(a21_input.value);
    gridContainer.matrix.a22 = parseFloat(a22_input.value);

    const e11 = parseFloat(e11_input.value);
    const e12 = parseFloat(e12_input.value);
    const e21 = parseFloat(e21_input.value);
    const e22 = parseFloat(e22_input.value);

    const v1 = parseFloat(v1_input.value);
    const v2 = parseFloat(v2_input.value);

    const [c1, u1, c2, u2] = updateProperties();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = light;
    ctx.strokeStyle = light;
    ctx.font = "12px serif";

    const e1 = new Vector(e11, e12);
    const e2 = new Vector(e21, e22);

    const v = new Vector(v1, v2);
    const vbar = gridContainer.matrix.multiply(v);

    const ebar_1 = gridContainer.matrix.multiply(e1);
    const ebar_2 = gridContainer.matrix.multiply(e2);

    drawGrid(gridContainer, e1, e2, "white", 0.5);
    drawGrid(gridContainer, ebar_1, ebar_2, "#7c98ff", 1);

    drawVector(gridContainer, e1, "white", 2, true);
    drawVector(gridContainer, e2, "white", 2, true);

    drawVector(gridContainer, ebar_1, "#7c98ff", 4, true);
    drawVector(gridContainer, ebar_2, "#7c98ff", 4, true);

    drawVector(gridContainer, u1, "#7cff98", 3, true);
    drawVector(gridContainer, u2, "#7cff98", 3, true);

    drawVector(gridContainer, u1._scale(c1), "#7cff98", 1, true);
    drawVector(gridContainer, u2._scale(c2), "#7cff98", 1, true);

    drawVector(gridContainer, v, "#ff987c", 3, true);
    drawVector(gridContainer, vbar, "#ff987c", 1, true);
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
    eigval_1_output.innerHTML = "λ1 = " + eigval_1;
    eigval_2_output.innerHTML = "λ2 = " + eigval_2;
    const u1 = gridContainer.matrix.eigenvector(eigval_1);
    const u2 = gridContainer.matrix.eigenvector(eigval_2);
    eigvec_1_output.innerHTML = "<span style=\"color:#7cff98\">u1</span> = " + u1.asString();
    eigvec_2_output.innerHTML = "<span style=\"color:#7cff98\">u2</span> = " + u2.asString();

    return [eigval_1, u1, eigval_2, u2];
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
    if (e.key == 'r') {
        gridContainer.resetFields();
        e11_input.value = 1;
        e12_input.value = 0;
        e21_input.value = 0;
        e22_input.value = 1;
    }
});

setInterval(appPeriodic, 10);