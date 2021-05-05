// -------------------------------- Classes personnelles
class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() { return this.x; }
    getY() { return this.y; }
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }
    ajouter(x, y) {
        this.x += x;
        this.y += y;
    }

    getAngle() { 
        if (this.y < 0)
            return - Math.acos(this.x) / this.getDistance(new Position(0, 0));   // cos = adjacent / hypothénuse (Pythagore)
        else
            return Math.acos(this.x) / this.getDistance(new Position(0, 0));
    }

    revertX() { this.x = this.x * -1; }
    revertY() { this.y = this.y * -1; }

    normalize() {
        var distance = this.getDistance(new Position(0, 0));
        this.x = this.x / distance;
        this.y = this.y / distance;
    }

    getDistance(point2) { return Math.sqrt(Math.pow(this.x - point2.getX(), 2) + Math.pow(this.y - point2.getY(), 2)); }
}

class boid {
    constructor(position, velocity) {
      this.position = position;
      this.velocity = velocity;
      this.velocity.normalize();
    }

    getPosition() { return this.position; }

    getVelocity() { return this.velocity; }

    setPosition(position) { this.position = position; }
    setVelocity(velocity) { this.velocity = velocity; this.velocity.normalize(); }

    getDistance(boid) { return this.position.getDistance(boid.getPosition()); }
}

// --------------------------------------------------------------


var width = window.innerWidth - 3;// document.offsetWidth;
var height = window.innerHeight - 4;//document.offsetHeight;
const drawingZone = document.createElement("canvas");
drawingZone.width = width;
drawingZone.height = height;

document.body.appendChild(drawingZone);

var squareRotation = 0.0;

let boids = [];
for (var i = 0; i < 10; i++)
{
    boids.push(new boid(new Position(Math.random()*10-5, Math.random()*10-5), new Position(Math.random(), Math.random()) ));
}
console.log(boids);
console.log("initialisation fini");
// http://www.vergenet.net/~conrad/boids/pseudocode.html

main();

//
// Start here
//
function main() {
    const gl = drawingZone.getContext('webgl');

    // If we don't have a GL context, give up now

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Vertex shader program

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

    // Fragment shader program

    const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);

    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    // Old Unanimate Draw the scene
    //drawScene(gl, programInfo, buffers);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl) {

    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Ici on définit la forme des objets
    const positions = [
        -0.5, -0.5,
        0.5, 0.0,
        -0.25, 0.0,
        -0.5, 0.5,
    ];


    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    const colors = [
        0.0, 0.0, 1.0, 1.0,    // RGBA (Rouge + Vert + Bleu + Transparence)
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
    ];
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
    };
}


function drawScene(gl, programInfo, buffers, deltaTime) {
    gl.clearColor(0.0, 1.0, 1.0, 1.0);  // Fond de couleur Cyan
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    modelViewMatrix = mat4.create();

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    
    modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [0.0, 0.0, -20.0]);
    
    for (var i = 0; i < boids.length; i++)
    {
        mat = mat4.create();
        mat4.translate(mat, modelViewMatrix, [boids[i].getPosition().getX(), boids[i].getPosition().getY(), 0.0]);
        mat4.rotate(mat, mat, boids[i].getVelocity().getAngle(), [0, 0, 1.0]);

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            mat);
        
        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }
    
    for (var i = 0; i < boids.length; i++)
    {
        let boidsTropProche = [];
        let boidsUnPeuProche = [];
        let boidsUnPeuLoin = [];

        for (var j = 0; j < boids.length; j++)
        {
            if (i != j) // On ne compare pas un individu à lui-même
            {
                if (boids[i].getDistance(boids[j]) < 1.1) // Trop proche
                {
                    boidsTropProche.push(boids[j]);
                }
                else if (boids[i].getDistance(boids[j]) < 2) // Un Peu Trop proche
                {
                    boidsUnPeuProche.push(boids[j]);
                }
                else if (boids[i].getDistance(boids[j]) < 3) // Un Peu Loin
                {
                    boidsUnPeuLoin.push(boids[j]);
                }
            }
        }

        var facteur1 = new Position(0, 0);
        var facteur2 = new Position(0, 0);
        var facteur3 = new Position(0, 0);

        if (boidsTropProche.length > 0)     // RULE "2"
        {
            for (var j  = 0; j < boidsTropProche.length; j++)
            {
                facteur1.ajouter(boids[i].getPosition().getX() - boidsTropProche[j].getPosition().getX(), boids[i].getPosition().getY() - boidsTropProche[j].getPosition().getY())
            }
        }

        if (boidsUnPeuProche.length > 0)     // RULE "3"
        {
            for (var j  = 0; j < boidsUnPeuProche.length; j++)
            {
                facteur2.ajouter(boidsUnPeuProche[j].getVelocity().getX(), boidsUnPeuProche[j].getVelocity().getY())
            }

            facteur2.setX(facteur2.getX() / boidsUnPeuProche.length);
            facteur2.setY(facteur2.getY() / boidsUnPeuProche.length);

            facteur2.setX((facteur2.getX() - boids[i].getVelocity().getX()) / 8);
            facteur2.setY((facteur2.getY() - boids[i].getVelocity().getY()) / 8);
        }

        if (boidsUnPeuLoin.length > 0)      // RULE "1"
        {
            for (var j  = 0; j < boidsUnPeuLoin.length; j++)
            {
                facteur3.ajouter(boidsUnPeuLoin[j].getPosition().getX(), boidsUnPeuLoin[j].getPosition().getY());
            }
            facteur3.setX(facteur3.getX() / boidsUnPeuLoin.length);    // Calcul de la moyenne des éléments proches avec une importance inversement proportionnelle à la distance
            facteur3.setY(facteur3.getY() / boidsUnPeuLoin.length);

            facteur3.setX((facteur3.getX() - boids[i].getPosition().getX()) / 100);
            facteur3.setY((facteur3.getY() - boids[i].getPosition().getY()) / 100);
            

        }

        boids[i].setVelocity(new Position(boids[i].getVelocity().getX() + facteur1.getX() + facteur2.getX() + facteur3.getX(), boids[i].getVelocity().getY() + facteur1.getY() + facteur2.getY() + facteur3.getY() ));
    }
    



    // Pour ne pas disparaitre de l'écran
    for (var i = 0; i < boids.length; i++)
    {
        boids[i].getPosition().ajouter(boids[i].getVelocity().getX() / 20, boids[i].getVelocity().getY() / 20);

        if (boids[i].getPosition().getX() < -5) {
            boids[i].getPosition().setX(-5);
            boids[i].getVelocity().revertX();
        }
        else if (boids[i].getPosition().getX() > 5) {
            boids[i].getPosition().setX(5);
            boids[i].getVelocity().revertX();
        }

        if (boids[i].getPosition().getY() < -5) {
            boids[i].getPosition().setY(-5);
            boids[i].getVelocity().revertY();
        }
        else if (boids[i].getPosition().getY() > 5) {
            boids[i].getPosition().setY(5);
            boids[i].getVelocity().revertY();
        }
    }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
