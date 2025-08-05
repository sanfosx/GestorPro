// Este archivo ahora lee las URLs desde las variables de entorno.
// Esto es seguro para subir a GitHub y es la práctica estándar para desplegar
// en servicios como Netlify o Vercel.

// Para el desarrollo local, crea un archivo `.env` en la raíz del proyecto
// y añade las siguientes líneas, reemplazando con tus URLs:
// VITE_AUTH_SCRIPT_URL=https://tu...url...aqui
// VITE_DATA_SCRIPT_URL=https://tu...url...aqui

declare global {
    interface ImportMeta {
        readonly env: {
            readonly VITE_AUTH_SCRIPT_URL: string;
            readonly VITE_DATA_SCRIPT_URL: string;
        }
    }
}

const AUTH_SCRIPT_URL = import.meta.env.VITE_AUTH_SCRIPT_URL;
const DATA_SCRIPT_URL = import.meta.env.VITE_DATA_SCRIPT_URL;

// Estas comprobaciones se ejecutan una vez al iniciar la aplicación.
// Si falta una variable, la aplicación fallará rápidamente con un error claro.
if (!AUTH_SCRIPT_URL) {
  throw new Error("ERROR DE CONFIGURACIÓN: La variable de entorno VITE_AUTH_SCRIPT_URL no está definida. Revisa tu archivo .env o la configuración de tu plataforma de despliegue (Netlify, Vercel, etc.).");
}

if (!DATA_SCRIPT_URL) {
  throw new Error("ERROR DE CONFIGURACIÓN: La variable de entorno VITE_DATA_SCRIPT_URL no está definida. Revisa tu archivo .env o la configuración de tu plataforma de despliegue.");
}

export { AUTH_SCRIPT_URL, DATA_SCRIPT_URL };