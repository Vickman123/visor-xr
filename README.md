# XR Model Viewer

**XR Model Viewer** es una aplicación web profesional de visualización 3D y realidad virtual arquitectónica. Desarrollada para **Meta Quest 3S** mediante **WebXR**, funcionando al mismo tiempo con alto rendimiento y controles fluidos en **PC** desde cualquier navegador web moderno.

Es un proyecto 100% estático (sin backend, sin base de datos, sin autenticación) listo para desplegarse en **GitHub Pages**.

---

## 🚀 Características Principales

- **Catálogo Dinámico de Proyectos**: Lectura reactiva desde `/public/projects.json` con modelos arquitectónicos precargados:
  - *Casa Residencial*
  - *Edificio Corporativo*
  - *Laboratorio Tecnológico*
- **Apertura de Archivos Locales ("📂 Abrir archivo local")**:
  - Arrastra o selecciona cualquier archivo `.glb` o `.gltf`.
  - Procesamiento 100% en el cliente (en la memoria del navegador). **Ningún archivo se sube a servidores externos**.
- **Visor de Escritorio (PC)**:
  - Controles de órbita completos: rotación, paneo (*pan*) y zoom suave con *damping*.
  - **Reset Camera**: Restaura la vista isométrica predeterminada.
  - **Ajustar Modelo (*Frame Model*)**: Centra y ajusta automáticamente la cámara a la volumetría del edificio.
  - **Manipulación**: Controles visuales (deslizadores de escala, rotación en eje Y y elevación).
  - **HUD de Métricas**: Muestra dimensiones arquitectónicas estimadas en metros ($X \times Y \times Z$), cantidad de triángulos/vértices y advertencia de rendimiento si el modelo es pesado.
- **Experiencia WebXR en Meta Quest 3S**:
  - Detección activa de compatibilidad WebXR en el navegador.
  - Botón interactivo: `🥽 Entrar en VR`.
  - **Modo Maqueta (Diorama)**: El edificio se presenta a escala reducida sobre una base de mesa frente al usuario ($y \approx 0.9\text{m}$, $z \approx -0.8\text{m}$).
  - **Modo Escala 1:1 ("ENTRAR AL MODELO")**: Escala arquitectónica natural ($1\text{m} = 1\text{ unidad}$), posicionando automáticamente al usuario en la entrada para caminar o teleportarse dentro del edificio.
  - **Controles con Controladores Meta Quest 3S**:
    - **Grip Derecho**: Agarrar y trasladar el modelo en el espacio.
    - **Interacción Bimanual (Ambos Grips)**:
      - Separar/juntar manos = Aumentar/reducir escala (*pinch-to-scale*).
      - Mover ambas manos = Trasladar el centro del modelo.
      - Girar las manos = Rotar el modelo sobre el eje vertical.
      - Suavizado exponencial para evitar saltos o vibraciones.
    - **Teleportación**: Arco visual parabólico con retícula luminosa en el suelo al apuntar con el gatillo o empujar el stick.
    - **Locomoción con Joystick**: Desplazamiento suave con el stick analógico izquierdo y giro por pasos (*snap turn* de 45°) con el stick derecho para eliminar el mareo (*motion sickness*).
  - **Menú Flotante 3D Espacial en VR**:
    - 🏠 Inicio (volver a biblioteca)
    - ↔ Escala (ciclo rápido de factores de escala)
    - 🔄 Reset (restaurar transformación inicial)
    - 📍 Teleport (alternar modo teleport)
    - 🚶 Movimiento (alternar modo joystick)
    - 🏗️ Modo Maqueta
    - 🚪 Entrar al Modelo
    - ❌ Salir de VR (`session.end()`)
- **Optimizado para Meta Quest 3S**:
  - *Frustum culling* activado en todas las mallas.
  - Iluminación ambiental y solar equilibrada de un solo pase con sombras suaves.
  - Sin post-procesamiento pesado para garantizar los 90 FPS estables.
  - Liberación rigurosa de memoria al cambiar de proyecto (`dispose` de geometrías, materiales y texturas).

---

## 🛠️ Stack Tecnológico

- **React 19**
- **Vite** (con `@tailwindcss/vite` y `@vitejs/plugin-basic-ssl`)
- **Three.js** (v0.186)
- **React Three Fiber** (`@react-three/fiber` v9)
- **@react-three/drei** (v10)
- **@react-three/xr** (v6)
- **TypeScript**
- **Lucide React**

---

## 💻 Instalación y Desarrollo Local

1. Clona el repositorio o abre el directorio:
   ```bash
   cd "PCPuma Visor arquitectonico"
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. (Opcional) Si deseas regenerar los modelos 3D de ejemplo:
   ```bash
   npm run generate-models
   ```

4. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

### 🥽 Probar en Meta Quest 3S desde la Red Local

WebXR exige un **contexto seguro (HTTPS o localhost)**. El proyecto incluye `@vitejs/plugin-basic-ssl` y `host: true`.

1. Al ejecutar `npm run dev`, Vite generará una dirección con tu IP local, por ejemplo:
   ```
   ➜  Network: https://192.168.1.50:5173/
   ```
2. Colócate tu **Meta Quest 3S** y abre el navegador oficial **Meta Quest Browser**.
3. Escribe en la barra de direcciones: `https://TU_IP_LOCAL:5173/`.
4. Acepta la advertencia de certificado auto-firmado de desarrollo local.
5. Selecciona cualquier proyecto y pulsa **"🥽 Entrar en VR"**.

---

## 🌐 Despliegue en GitHub Pages

La aplicación está completamente configurada para desplegarse de manera automática mediante **GitHub Actions**:

1. Sube tu código a un repositorio en GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit XR Model Viewer"
   git branch -M main
   git remote add origin https://github.com/USUARIO/NOMBRE-REPOSITORIO.git
   git push -u origin main
   ```
2. En tu repositorio de GitHub, ve a **Settings > Pages**.
3. En **Build and deployment > Source**, selecciona **GitHub Actions**.
4. Cada vez que hagas `push` a la rama `main`, el workflow `.github/workflows/deploy.yml` compilará y desplegará automáticamente el sitio en:
   `https://USUARIO.github.io/NOMBRE-REPOSITORIO/`

---

## 📁 Estructura del Proyecto

```
├── .github/
│   └── workflows/
│       └── deploy.yml              # Despliegue automatizado a GitHub Pages
├── public/
│   ├── projects.json               # Catálogo dinámico de proyectos
│   ├── models/                     # Modelos GLB arquitectónicos (casa, edificio, laboratorio)
│   └── thumbnails/                 # Miniaturas de proyectos
├── scripts/
│   └── generate-sample-models.mjs  # Generador de modelos GLB y miniaturas
├── src/
│   ├── types/
│   │   └── index.ts                # Tipos TypeScript
│   ├── hooks/
│   │   ├── useWebXRSupport.ts      # Detección de compatibilidad WebXR
│   │   └── useModelLoader.ts       # Carga reactiva de GLB con Draco y métricas
│   ├── utils/
│   │   └── modelMetrics.ts         # Cálculo de dimensiones reales y rendimiento
│   ├── components/
│   │   ├── catalog/                # Pantalla principal, tarjetas y modal local
│   │   ├── desktop/                # Visor PC, HUD de métricas, barra de herramientas
│   │   ├── scene/                  # Lienzo Canvas, iluminación, suelo y contenedor 3D
│   │   ├── xr/                     # Soporte Quest 3S: bimanual, teleport, joystick
│   │   │   └── menu/
│   │   │       └── VRFloatingMenu.tsx # Menú 3D espacial en realidad virtual
│   │   └── common/                 # Indicador de progreso de carga y alertas
│   ├── App.tsx                     # Orquestador de vistas
│   ├── index.css                   # Estilos con Tailwind CSS
│   └── main.tsx
├── vite.config.ts                  # Base relativa para GitHub Pages y SSL local
└── package.json
```

---

## 📄 Licencia

MIT
