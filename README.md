# Physically-Based Material Rendering
Interactive WebGL demo featuring dynamic lighting, HDR environment maps, and PBR porcelain / metal shaders.

## Project Overview
We built an **interactive 3D rendering environment** that integrates:
- Dynamic lighting
- Environment mapping
- Advanced material models

This work builds upon foundational concepts introduced earlier in the course. We expanded our scene to include diverse geometries, employed a **cubemap** for realistic environments, and implemented sophisticated shading techniques for physically plausible materials such as matte porcelain and metallic surfaces. 

## Features

### I. Expanding Geometric Diversity
To showcase the rendering system's capabilities, we:
- Introduced new models (e.g., rocks and spheres) sourced from open libraries.
- Designed the system to handle varying geometric complexities effectively.

This diversity demonstrates the robustness of our rendering pipeline across different shapes and textures.

### II. Cubemap Implementation: Simulating Realistic Environments
- **High-resolution cubemap**:  Users can choose from multiple high-resolution cubemaps, providing a panoramic background that suits different moods and environments, thus enhancing the overall immersive experience.
- **Environmental reflections**: The selected cubemap texture is applied to reflective models, adding depth and realism.
- **Dynamic lighting**: Seamlessly integrates with cubemap reflections, improving overall scene fidelity.

### III. Material Rendering Techniques

#### 1. Matte Porcelain Texture
We implemented a matte porcelain material by simulating:
- Soft specular highlights
- Matte diffuse reflection
- Subtle environmental reflections

Key equations:
- **Specular Reflectance**: Dependent on surface normal (`n`), view vector (`v`), and light vector (`l`).
- **Fresnel Effect (Schlick’s Approximation)**: Reflectance at normal incidence (`Fo`) based on material's index of refraction (IOR).
- **Microfacet Normal Distribution Function (NDF)**: Uses roughness parameter (`α`) and half-vector angle (`θh`).
- **Geometry Term**: Accounts for occlusion and masking of light.

#### 2. Metallic Texture
Our metallic rendering features:
- **Specular reflections**: Based on the Phong reflection model:
- **Cubemap integration**: Adds realistic environment reflections:

### IV. User-Friendly Interface
- Dynamic lighting and color adjustments from previous work were refined.
- Enhanced user interface for easier texture manipulation and parameter adjustments.
- Interactive controls allow real-time exploration of material and environmental settings.

## Conclusion
This project demonstrates the integration of **dynamic lighting**, **environment mapping**, and **advanced material rendering techniques** in an interactive 3D environment. By:
- Diversifying geometric models,
- Applying realistic cubemap reflections,
- Implementing matte porcelain and metallic materials,

we significantly improved visual fidelity. The refined user interface further enriches the interactive experience, making this a comprehensive and engaging rendering system.

## Library and Resources
### Library
- **[gl-matrix](https://github.com/toji/gl-matrix):** A high-performance matrix and vector math library for JavaScript, utilized extensively in our rendering system for transformations and calculations.

### Models
- **Sphere model:** [MIT Web Logo Shapes](https://web.mit.edu/djwendel/www/weblogo/shapes/)
- **Rock model:** [Casual Effects Model Repository](https://casual-effects.com/data/)

### Cubemap
- **Yokohama2:** [Humus - Yokohama2](https://www.humus.name/index.php?page=Textures)
- **Lycksele:** [Humus - Lycksele](https://www.humus.name/index.php?page=Cubemap&item=Lycksele)
- **Palm tree:** [Humus - Palmtrees](https://www.humus.name/index.php?page=Cubemap&item=PalmTrees)
- **Mountain:** [Humus - Maskonaive](https://www.humus.name/index.php?page=Cubemap&item=Maskonaive)

Special thanks to course instructors and open-source communities for providing valuable resources and support for our project.


## How to Run
 ```bash
 git clone (this project)
 cd 
 python -m http.server 8000 # or any static server
 # open http://localhost:8000```
