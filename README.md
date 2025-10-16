🏅 Oh! SanSi - Sistema de Gestión de Olimpiadas
Bienvenido al repositorio del frontend para Oh! SanSi, el sistema de gestión integral para las Olimpiadas de Ciencia y Tecnología. Esta aplicación está construida con tecnologías modernas para ofrecer una experiencia de usuario fluida, rápida y robusta.

🚀 Sobre el Proyecto
Este proyecto es una Single Page Application (SPA) desarrollada con React y Vite, diseñada para facilitar la administración de todos los aspectos de la olimpiada. Permite a los administradores gestionar áreas de competencia, niveles, asignar evaluadores y responsables, y registrar a los competidores de manera masiva y eficiente.

✨ Características Principales
El sistema cuenta con una arquitectura modular y escalable, dividida en las siguientes funcionalidades clave:

🔐 Autenticación: Sistema de inicio de sesión seguro para el personal autorizado.

📚 Gestión de Áreas y Niveles: Permite crear y visualizar las áreas de competencia (ej. Matemáticas, Física) y los niveles (ej. Primero de Secundaria).

🔗 Asignación de Niveles: Interfaz intuitiva para asignar qué niveles están disponibles en cada área, con protección contra la pérdida de cambios no guardados.

👥 Gestión de Usuarios: Formularios robustos para registrar Responsables de Área y Evaluadores en el sistema.

📄 Importación Masiva de Competidores: Potente herramienta para registrar participantes subiendo un archivo CSV, con validaciones avanzadas en tiempo real, sanitización de datos y feedback detallado de errores por fila.

📊 Lista de Competidores: Visualizador jerárquico que permite explorar a los participantes registrados, agrupados por área y nivel.

📝 Parámetros de Calificación: Módulo para definir los criterios y porcentajes de evaluación para cada categoría de la competencia.

🛠️ Stack Tecnológico
Este proyecto está construido con un stack de tecnologías moderno y de alto rendimiento:

⚙️ Primeros Pasos (Getting Started)
Sigue estos pasos para levantar el proyecto en tu entorno de desarrollo local.

Prerrequisitos
Node.js: Asegúrate de tener una versión LTS (v18 o superior).

npm o yarn: Administrador de paquetes de Node.js.

Instalación

Clona el repositorio:
git clone https://github.com/tu-usuario/project-ohsansi-frontend.git
Navega al directorio del proyecto:

cd project-ohsansi-frontend
Instala las dependencias:

npm install
Ejecuta el servidor de desarrollo:

npm run dev
La aplicación estará disponible en http://localhost:3000.

📂 Estructura del Proyecto
El proyecto sigue una arquitectura modular orientada a funcionalidades (feature-based), lo que facilita la escalabilidad y el mantenimiento.

src/
├── api/          # Configuración central de Axios.
├── auth/         # Lógica de autenticación (login, rutas protegidas).
├── components/   # Componentes de UI reutilizables (Layout, Modales, Botones).
├── features/     # El corazón del proyecto, cada carpeta es una funcionalidad.
│   ├── asignaciones/
│   ├── evaluadores/
│   ├── inscritos/
│   ├── ... (etc.)
│   └── [feature]/
│       ├── components/ # Componentes específicos de la feature.
│       ├── hooks/      # Hooks con la lógica de estado y fetching.
│       ├── routes/     # El componente principal de la página.
│       ├── services/   # Funciones para las llamadas a la API.
│       ├── types/      # Interfaces y tipos de TypeScript.
│       └── utils/      # Funciones de ayuda y validaciones.
├── styles/       # Estilos globales y configuración de Tailwind.
└── main.tsx      # Punto de entrada de la aplicación.
📜 Scripts Disponibles
En el package.json, encontrarás los siguientes scripts:

npm run dev: Inicia el servidor de desarrollo con Hot-Reload.

npm run build: Compila la aplicación para producción en la carpeta dist/.

npm run lint: Ejecuta ESLint para analizar el código en busca de errores.

npm run format: Formatea todo el código con Prettier.

npm run preview: Sirve la carpeta dist/ para previsualizar la build de producción.