/* 
 * Initializing GL object
 */
var gl;
var drawCubemapBackground = true; // Enable cubemap background rendering by default
var cubeVertexBuffer;
var cubeMapTexture;
var cubeVertices = new Float32Array([
    -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1, // Back face
    -1, -1,  1, -1,  1,  1,  1,  1,  1,  1, -1,  1, // Front face
    -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1, // Top face
    -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1, // Bottom face
    1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1, // Right face
    -1, -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1  // Left face
]);

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if ( !gl ) alert("Could not initialise WebGL, sorry :-(");

    gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, validateNoneOfTheArgsAreUndefined);
}

/*
 * Initializing object geometries
 */
var meshes, meshTransforms;
var currentMesh, currentTransform;
function initMesh() {
    // Load object meshes, added new meshes.
    meshes = [
        new OBJ.Mesh(teapot_mesh_str),
        new OBJ.Mesh(bunny_mesh_str),
        new OBJ.Mesh(rock_mesh_str),
        new OBJ.Mesh(sphere_mesh_str)
    ];

    // Initialize buffers for all models
    meshes.forEach(mesh => OBJ.initMeshBuffers(gl, mesh));
    // Default to the first model (teapot)
    currentMesh = meshes[0];

    // Create transformation matrices for all models
    meshTransforms = [mat4.create(), mat4.create(), mat4.create(), mat4.create()];

    // Set per-object transforms to make them better fitting the viewport
    // Transform for Teapot
    mat4.identity(meshTransforms[0]);
    mat4.rotateX(meshTransforms[0], -1.5708);
    mat4.scale(meshTransforms[0], [0.15, 0.15, 0.15]);        

    // Transform for Bunny
    mat4.identity(meshTransforms[1]);
    mat4.translate(meshTransforms[1], [0.5, 0, 0]);

    // Transform for Rock
    mat4.identity(meshTransforms[2]);
    mat4.translate(meshTransforms[2], [0, 1, 0]);
    mat4.scale(meshTransforms[2], [0.02, 0.02, 0.02]);


    // Transform for Sphere
    mat4.identity(meshTransforms[3]);
    mat4.scale(meshTransforms[3], [0.5, 0.5, 0.5]); // Scale
    mat4.translate(meshTransforms[3], [0, 1, 0]); // Translate

    // Default transformation for first model
    currentTransform = meshTransforms[0];
}

function initCubemapBuffers() {
    cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    console.log("Cube Vertex Buffer Bound:", gl.getParameter(gl.ARRAY_BUFFER_BINDING));
    console.log("Cube Vertex Buffer Data:", cubeVertices);
}

function createCubeMap(gl, images) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faces = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    faces.forEach((face, i) => {
        gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
    });

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
}

// Usage example
function loadCubeMap(gl, callback) {
    const imageSources = [
        './Yokohama2/posx.jpg',   // Positive X
        './Yokohama2/negx.jpg',    // Negative X
        './Yokohama2/posy.jpg',     // Positive Y
        './Yokohama2/negy.jpg',  // Negative Y
        './Yokohama2/posz.jpg',   // Positive Z
        './Yokohama2/negz.jpg'     // Negative Z
    ];

    // Create image elements
    const images = imageSources.map(src => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        return img;
    });

    Promise.all(images.map(img => new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load ${img.src}`));
    })))
        .then(loadedImages => {
            console.log("All cube map images loaded successfully.");
            cubeMapTexture = createCubeMap(gl, loadedImages);

            if (!cubeMapTexture) {
                console.error("Cube map texture creation failed.");
                return; // Do not start rendering if cube map fails
            }

            callback(); // Start the tick loop
        })
        .catch(error => {
            console.error("Error loading cube map images:", error);
        });


}

/*
 * Initializing shaders 
 */
var shaderPrograms;
var currentProgram;
var lightProgram;
function createShader(vs_id, fs_id) {
    var shaderProg = createShaderProg(vs_id, fs_id);

    // Set vertex attributes
    shaderProg.vertexPositionAttribute = gl.getAttribLocation(shaderProg, "aVertexPosition");
    if (shaderProg.vertexPositionAttribute !== -1) {
        gl.enableVertexAttribArray(shaderProg.vertexPositionAttribute);
    }
    shaderProg.vertexNormalAttribute = gl.getAttribLocation(shaderProg, "aVertexNormal");
    if (shaderProg.vertexNormalAttribute !== -1) {
        gl.enableVertexAttribArray(shaderProg.vertexNormalAttribute);
    }

    shaderProg.pMatrixUniform = gl.getUniformLocation(shaderProg, "uPMatrix");
    shaderProg.mvMatrixUniform = gl.getUniformLocation(shaderProg, "uMVMatrix");
    shaderProg.nMatrixUniform = gl.getUniformLocation(shaderProg, "uNMatrix");
    shaderProg.lightPosUniform = gl.getUniformLocation(shaderProg, "uLightPos");
    shaderProg.lightPowerUniform = gl.getUniformLocation(shaderProg, "uLightPower");
    shaderProg.kdUniform = gl.getUniformLocation(shaderProg, "uDiffuseColor");
    shaderProg.ambientUniform = gl.getUniformLocation(shaderProg, "uAmbient");

    // Cubemap support
    shaderProg.environmentMapUniform = gl.getUniformLocation(shaderProg, "uEnvironmentMap");
    shaderProg.useEnvironmentMapUniform = gl.getUniformLocation(shaderProg, "useEnvironmentMap"); // Flag to enable cubemap

    // Declare the uSpecularColor uniform
    shaderProg.specularColorUniform = gl.getUniformLocation(shaderProg, "uSpecularColor");

    return shaderProg;
}

function initShaders() {
    // Declaring shading model specific uniform variables
    shaderPrograms = [
        createShader("shader-vs", "shader-fs0"),
        createShader("shader-vs", "shader-fs1-1"),
        createShader("shader-vs", "shader-fs1-2"),
        createShader("shader-vs", "shader-fs1-3"),
        createShader("shader-vs", "shader-fs2"),
        createShader("shader-vs", "shader-fs3-1"),
        createShader("shader-vs", "shader-fs3-2"),
        createShader("shader-vs", "shader-fs4"),
        createShader("shader-vs", "shader-fs-metallic"), // 这里。。。。。。
    ];
    currentProgram = shaderPrograms[0];


    for (let i = 0; i < shaderPrograms.length; i++) {
        gl.useProgram(shaderPrograms[i]);
        if (shaderPrograms[i].specularColorUniform) {
            gl.uniform3fv(shaderPrograms[i].specularColorUniform, [1.0, 1.0, 1.0]);  // Default to white
        }
    }

    // Phong shading
    shaderPrograms[5].exponentUniform = gl.getUniformLocation(shaderPrograms[5], "uExponent");
    gl.useProgram(shaderPrograms[5]);
    gl.uniform1f(shaderPrograms[5].exponentUniform, 50.0);

    // Blinn-Phong shading
    shaderPrograms[6].exponentUniform = gl.getUniformLocation(shaderPrograms[6], "uExponent");
    gl.useProgram(shaderPrograms[6]);
    gl.uniform1f(shaderPrograms[6].exponentUniform, 50.0);

    // Microfacet shading
    shaderPrograms[7].iorUniform = gl.getUniformLocation(shaderPrograms[7], "uIOR");
    shaderPrograms[7].betaUniform = gl.getUniformLocation(shaderPrograms[7], "uBeta");
    gl.useProgram(shaderPrograms[7]);
    gl.uniform1f(shaderPrograms[7].iorUniform, 5.0);
    gl.uniform1f(shaderPrograms[7].betaUniform, 0.2);

    //metal 这里！！！！！！！！！！！！！！！
    shaderPrograms[8].exponentUniform = gl.getUniformLocation(shaderPrograms[8], "uExponent");
    gl.useProgram(shaderPrograms[8]);
    gl.uniform1f(shaderPrograms[8].exponentUniform, 50.0);

    // Initializing light source drawing shader
    lightProgram = createShaderProg("shader-vs-light", "shader-fs-light");
    lightProgram.vertexPositionAttribute = gl.getAttribLocation(lightProgram, "aVertexPosition");
    gl.enableVertexAttribArray(lightProgram.vertexPositionAttribute);
    lightProgram.pMatrixUniform = gl.getUniformLocation(lightProgram, "uPMatrix");
}


/*
 * Initializing buffers
 */
var lightPositionBuffer;
function initBuffers() {
    lightPositionBuffer = gl.createBuffer();
}

/*
 * Main rendering code 
 */

// Basic rendering parameters
var mvMatrix = mat4.create();                   // Model-view matrix for the main object
var pMatrix = mat4.create();                    // Projection matrix

// Lighting control
var lightMatrix = mat4.create();                // Model-view matrix for the point light source
var lightPos = vec3.create();                   // Camera-space position of the light source
var lightPower = 5.0;                           // "Power" of the light source

// Common parameters for shading models
var diffuseColor = [0.2392, 0.5216, 0.7765];    // Diffuse color
var ambientIntensity = 0.1;                     // Ambient

// Animation related variables
var rotY = 0.0;                                 // object rotation
var rotY_light = 0.0;                           // light position rotation

function setUniforms(prog) {
    gl.uniformMatrix4fv(prog.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(prog.mvMatrixUniform, false, mvMatrix);

    const nMatrix = mat4.transpose(mat4.inverse(mvMatrix));
    gl.uniformMatrix4fv(prog.nMatrixUniform, false, nMatrix);

    gl.uniform3fv(prog.lightPosUniform, lightPos);
    gl.uniform1f(prog.lightPowerUniform, lightPower);
    gl.uniform3fv(prog.kdUniform, diffuseColor);
    gl.uniform1f(prog.ambientUniform, ambientIntensity);

    // Bind the cubemap texture if available
    if (prog.environmentMapUniform && cubeMapTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);
        gl.uniform1i(prog.environmentMapUniform, 0);
    }
    if (prog.useEnvironmentMapUniform) {
        gl.uniform1i(prog.useEnvironmentMapUniform, drawCubemapBackground ? 1 : 0);
    }
}

var draw_light = false;
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.depthMask(false);
    if (drawCubemapBackground && cubeMapTexture) {
        gl.useProgram(shaderPrograms[shaderPrograms.length - 1]); // Use the last shader program
        setUniforms(shaderPrograms[shaderPrograms.length - 1]);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
        gl.vertexAttribPointer(
            shaderPrograms[shaderPrograms.length - 1].vertexPositionAttribute,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );
        gl.enableVertexAttribArray(shaderPrograms[shaderPrograms.length - 1].vertexPositionAttribute);

        // Render the cube
        gl.drawArrays(gl.TRIANGLES, 0, 36);

    }
    gl.depthMask(true);

    mat4.perspective(35, gl.viewportWidth/gl.viewportHeight, 0.1, 1000.0, pMatrix);

    mat4.identity(lightMatrix);
    mat4.translate(lightMatrix, [0.0, -1.0, -7.0]);
    mat4.rotateX(lightMatrix, 0.3);
    mat4.rotateY(lightMatrix, rotY_light);

    lightPos.set([0.0, 2.5, 3.0]);
    mat4.multiplyVec3(lightMatrix, lightPos);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, -1.0, -7.0]);
    mat4.rotateX(mvMatrix, 0.3);
    mat4.rotateY(mvMatrix, rotY);
    mat4.multiply(mvMatrix, currentTransform);

    gl.useProgram(currentProgram);
    setUniforms(currentProgram);   

    gl.bindBuffer(gl.ARRAY_BUFFER, currentMesh.vertexBuffer);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, currentMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, currentMesh.normalBuffer);
    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, currentMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, currentMesh.indexBuffer);
    gl.drawElements(gl.TRIANGLES, currentMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    if ( draw_light ) {
        gl.useProgram(lightProgram);
        gl.uniformMatrix4fv(lightProgram.pMatrixUniform, false, pMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, lightPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(lightPos), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(lightProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

var lastTime = 0;
var rotSpeed = 60, rotSpeed_light = 60;
var animated = false, animated_light = false;
var stopTick = false; // Add a flag to control the rendering loop

function tick() {
    if (stopTick) {
        console.log("Stopping tick loop.");
        return; // Stop the rendering loop
    }

    requestAnimationFrame(tick);

    const timeNow = new Date().getTime();
    if (lastTime !== 0) {
        const elapsed = timeNow - lastTime;
        if (animated) rotY += (rotSpeed * 0.0175 * elapsed) / 1000.0;
        if (animated_light) rotY_light += (rotSpeed_light * 0.0175 * elapsed) / 1000.0;
    }
    lastTime = timeNow;

    try {
        drawScene(); // Render the scene
        const error = gl.getError(); // Check for WebGL errors
        if (error !== gl.NO_ERROR) {
            console.error("WebGL Error during rendering:", error);
            //stopTick = true; // Stop rendering on error
        }
    } catch (error) {
        console.error("Error during rendering:", error);
        //stopTick = true; // Stop rendering on error
    }
}



function webGLStart() {
    var canvas = $("#canvas0")[0];

    initGL(canvas);
    initMesh();
    initShaders();
    initBuffers();
    initCubemapBuffers();

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);

    currentProgram = shaderPrograms[0];
    loadCubeMap(gl, function() {
        console.log("Cube map loaded successfully. Starting tick...");
        tick(); // Only start the loop after the cube map is loaded
    });

}
