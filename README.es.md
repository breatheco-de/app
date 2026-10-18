# App 4Geeks.com

## Primeros pasos

1. Instalar Bun:

```bash
# Si Bun no está instalado en tu entorno de trabajo (Gitpod, Codespaces, etc.)
npm install -g bun
```

2. Instalar paquetes:

```bash
bun install
```

3. Copiar el contenido de `.env.example` a `.env.development` y `.env.production`

4. Generar los archivos necesarios antes de iniciar:

```bash
bun prepare-repo
# o
bun run prepare-repo
```

5. Ejecutar el servidor de desarrollo:

```bash
bun run dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador para ver el resultado.

Puedes empezar a editar la página modificando `pages/index.js`. La página se actualiza automáticamente a medida que editas el archivo.

Puedes acceder a las [rutas API](https://nextjs.org/docs/api-routes/introduction) en [http://localhost:3000/api/hello](http://localhost:3000/api/hello). Este punto final se puede editar en `pages/api/hello.js`.

El directorio `pages/api` está mapeado a `/api/*`. Los archivos en este directorio se tratan como [rutas API](https://nextjs.org/docs/api-routes/introduction) en lugar de páginas de React.

## Caché del Registro de Activos

### Lección sobre cómo restablecer la caché:

Los activos se almacenan en caché internamente para un mejor rendimiento. Puedes restablecer un activo con la siguiente solicitud:

```bash
PUT https://4geeks.com/api/asset/<slug>
```

### Lección sobre cómo obtener la caché:

Puedes abrir la terminal de Redis en Vercel y escribir `GET <asset_slug>` para obtener el JSON más reciente del activo de la API de BreatheCode. [Aquí tienes un ejemplo](https://www.awesomescreenshot.com/image/45567980?key=5be790828078a884b05a6f6598510541).

## Más información

Para saber más sobre Next.js, consulta los siguientes recursos:

- [Documentación de Next.js](https://nextjs.org/docs): descubre las características y la API de Next.js.
- [Aprende Next.js](https://nextjs.org/learn): un tutorial interactivo de Next.js.

Puedes consultar el repositorio de GitHub de Next.js](https://github.com/vercel/next.js/). ¡Agradecemos tus comentarios y contribuciones!

## Implementar en Vercel

La forma más sencilla de implementar tu aplicación Next.js es usar la [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) de los creadores de Next.js.

Consulta nuestra [Documentación de implementación de Next.js](https://nextjs.org/docs/deployment) para obtener más información.

## Ejecutar lint
```bash
bun run lint:files
```

## Corregir errores de lint
```bash
bun run lint:fix
```