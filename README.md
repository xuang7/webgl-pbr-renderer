# 112 Final Project - Material Rendering

## Group Members
- Xuan Gu
- Jiatong (Betty) Liu

## GitHub Repository
[Project Repository](https://github.com/xuang7/112finalproject?tab=readme-ov-file#readme)

---

## Project Overview
Our final project focuses on creating an **interactive 3D rendering environment** that integrates:
- Dynamic lighting
- Environment mapping
- Advanced material models

This work builds upon foundational concepts introduced earlier in the course. We expanded our scene to include diverse geometries, employed a **cubemap** for realistic environments, and implemented sophisticated shading techniques for physically plausible materials such as matte porcelain and metallic surfaces. 

This README highlights our progress, technical methods, challenges faced, and the resulting visual fidelity.

---

## Features

### I. Expanding Geometric Diversity
To showcase the rendering system's capabilities, we:
- Introduced new models (e.g., rocks and spheres) sourced from open libraries.
- Designed the system to handle varying geometric complexities effectively.

This diversity demonstrates the robustness of our rendering pipeline across different shapes and textures.

---

### II. Cubemap Implementation: Simulating Realistic Environments
- **High-resolution cubemap**: Provides a panoramic background for enhanced immersion.
- **Environmental reflections**: Applied cubemap textures to reflective models, adding depth and realism.
- **Dynamic lighting**: Seamlessly integrates with cubemap reflections, improving overall scene fidelity.

---

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


---

### IV. User-Friendly Interface
- Dynamic lighting and color adjustments from previous work were refined.
- Enhanced user interface for easier texture manipulation and parameter adjustments.
- Interactive controls allow real-time exploration of material and environmental settings.

---

## Conclusion
This project demonstrates the integration of **dynamic lighting**, **environment mapping**, and **advanced material rendering techniques** in an interactive 3D environment. By:
- Diversifying geometric models,
- Applying realistic cubemap reflections, and
- Implementing matte porcelain and metallic materials,

we significantly improved visual fidelity. The refined user interface further enriches the interactive experience, making this a comprehensive and engaging rendering system.

---

## How to Run
1. Clone the repository:
 ```bash
 git clone https://github.com/xuang7/112finalproject.git
 cd 112finalproject
 python -m http.server 8000
 http://localhost:8000


Library: gl-matrix
model:
have not used: https://casual-effects.com/data/
sphere: https://web.mit.edu/djwendel/www/weblogo/shapes/

cubemap: https://www.humus.name/index.php?page=Textures Yokohama2
