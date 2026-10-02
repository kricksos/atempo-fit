# Atempo Fit

Atempo Fit ayuda a crear y mantener un plan personal de entrenamiento, nutrición y seguimiento del progreso, adaptado al objetivo, experiencia, disponibilidad y equipamiento de cada persona.

## Stack

- Next.js App Router y React
- TypeScript y Tailwind CSS
- Supabase Auth, PostgreSQL y Row Level Security
- Vercel para despliegue

## Desarrollo local

Requisitos: Node.js y un proyecto Supabase configurado.

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

Crea `.env.local` a partir de `.env.example` y añade las credenciales del proyecto Supabase. No publiques ese archivo ni compartas claves de servicio.

## Validación

```bash
npm run typecheck
npm run lint
npm run build
```

## Base de datos

Las migraciones de Supabase están en `supabase/migrations`. Deben aplicarse en orden en el proyecto correspondiente. Las migraciones `0040` a `0044` importan, normalizan, curan y limpian el catálogo de ejercicios; revisa su estado antes de ejecutarlas en producción.

## Seguridad y publicación

Antes de publicar, configura un SMTP transaccional verificado, las URLs de redirección de Auth, el dominio de producción y las variables de entorno en Vercel. Completa también los datos legales pendientes en las páginas de privacidad y condiciones.
