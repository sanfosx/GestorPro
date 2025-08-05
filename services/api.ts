import type { Client, Project, Note, Link, Prompt, Bot, Flow } from '../types';
import { DATA_SCRIPT_URL } from '../config';

// =================================================================
// SCRIPT DE DATOS (script.js)
//
// La URL ahora se gestiona a través de variables de entorno,
// leídas por el archivo `config.ts`.
// =================================================================

async function callAppsScript(action: string, payloadData?: any): Promise<any> {
  // La verificación de la URL ahora se hace en config.ts al iniciar la app.
  // Esto asegura que la app no se ejecute con una configuración inválida.

  const sessionString = localStorage.getItem('user_session');
  if (!sessionString) {
    // Esto no debería ocurrir si la lógica de la App es correcta, pero es una salvaguarda.
    alert("Sesión no válida. Por favor, inicie sesión de nuevo.");
    window.location.reload(); // Forzar recarga para ir a la pantalla de login
    throw new Error('User is not authenticated. No session found.');
  }

  const session = JSON.parse(sessionString);
  if (!session.id_sheet) {
    throw new Error('ID de hoja de cálculo no encontrado en la sesión.');
  }

  // Envolver el payload original junto con el id_sheet
  const fullPayload = {
    id_sheet: session.id_sheet,
    data: payloadData,
  };

  try {
    const res = await fetch(DATA_SCRIPT_URL, {
      method: 'POST',
      // Se omite la cabecera 'Content-Type' a propósito.
      // Al enviar un string en el body, el navegador usará por defecto
      // 'text/plain', lo que evita una solicitud de "pre-vuelo" (preflight) de CORS
      // y es más compatible con Google Apps Script.
      body: JSON.stringify({ action, payload: fullPayload }),
      redirect: 'follow'
    });

    const textResponse = await res.text();
    
    if (!textResponse) {
        throw new Error('Respuesta vacía del servidor de Apps Script. Revisa los logs del script.');
    }

    let response;
    try {
        response = JSON.parse(textResponse);
    } catch (e) {
        console.error("Error al parsear la respuesta del script. No es un JSON válido:", textResponse);
        throw new Error("La respuesta del backend no es un JSON válido. Revisa los logs del script de Google.");
    }

    if (!response.success) {
      console.error('Apps Script Error:', response.error);
      throw new Error(`${response.error || 'Error desconocido en el script de Google.'}`);
    }

    return response.data;
  } catch (error) {
    console.error(`Error al llamar a la acción '${action}':`, error);
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.name === 'TypeError')) {
        const troubleshootingMessage = `
------------------------------------------------------------------------------------
🔴 ERROR DE CONEXIÓN (Failed to fetch) 🔴

Este error casi siempre significa que la aplicación web (frontend) no puede comunicarse con tu script de Google (backend).

PASO DE DIAGNÓSTICO:
1. Copia esta URL: ${DATA_SCRIPT_URL}
2. Pégala en una nueva pestaña del navegador y presiona Enter.

QUÉ ESPERAR:
- ✅ SI VES UN ERROR que dice "La secuencia de comandos se completó, pero no se devolvió nada", ¡eso es BUENO! Significa que la implementación es correcta y el problema está en otro lugar.
- ❌ SI VES UNA PÁGINA DE ERROR DE GOOGLE (ej. "No se encontró la página", "Necesitas permiso", etc.), el problema está en tu implementación de Google Apps Script.

CÓMO ARREGLARLO:
1. Vuelve a tu proyecto de Apps Script ('script.js').
2. Haz clic en "Implementar" > "Nueva implementación".
3. "Quién tiene acceso" DEBE estar configurado como "Cualquiera".
4. Copia la NUEVA URL de la aplicación web y pégala en la variable VITE_DATA_SCRIPT_URL dentro de tu archivo '.env' (para desarrollo local) o en la configuración de entorno de tu proveedor de hosting (Netlify, Vercel).

¡RECUERDA! Cada cambio en el código del script requiere una NUEVA implementación.
------------------------------------------------------------------------------------
        `;
        console.error(troubleshootingMessage);
        alert("Error de conexión con el backend (Failed to fetch). Revisa la consola (F12) para ver los pasos de diagnóstico.");
    }
    throw error;
  }
}

// --- CLIENTS API ---
export const getClients = async (): Promise<Client[]> => {
  return callAppsScript('getClients');
};

export const getClientByPhone = async (phone: string): Promise<Client | null> => {
    return callAppsScript('getClientByPhone', phone);
};

export const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
  return callAppsScript('addClient', clientData);
};

export const updateClient = async (clientData: Client): Promise<Client> => {
  return callAppsScript('updateClient', clientData);
};

export const deleteClient = async (clientId: string): Promise<{ success: boolean }> => {
  return callAppsScript('deleteClient', clientId);
};

// --- PROJECTS API ---
export const getProjects = async (): Promise<Project[]> => {
  return callAppsScript('getProjects');
};

export const addProject = async (projectData: Omit<Project, 'id' | 'clientName'>): Promise<Project> => {
  return callAppsScript('addProject', projectData);
};

export const updateProject = async (projectData: Omit<Project, 'clientName'>): Promise<Project> => {
  return callAppsScript('updateProject', projectData);
};

export const deleteProject = async (projectId: string): Promise<{ success: boolean }> => {
  return callAppsScript('deleteProject', projectId);
};

// --- NOTES API ---
export const getNotesByProjectId = async (projectId: string): Promise<Note[]> => {
  return callAppsScript('getNotesByProjectId', projectId);
};
export const addNote = async (noteData: Omit<Note, 'id' | 'createdAt'>): Promise<Note> => {
  return callAppsScript('addNote', noteData);
};
export const updateNote = async (noteData: Note): Promise<Note> => {
  return callAppsScript('updateNote', noteData);
};
export const deleteNote = async (noteId: string): Promise<{ success: boolean }> => {
  return callAppsScript('deleteNote', noteId);
};

// --- LINKS API ---
export const getLinksByProjectId = async (projectId: string): Promise<Link[]> => {
  return callAppsScript('getLinksByProjectId', projectId);
};
export const addLink = async (linkData: Omit<Link, 'id' | 'createdAt'>): Promise<Link> => {
  return callAppsScript('addLink', linkData);
};
export const updateLink = async (linkData: Link): Promise<Link> => {
  return callAppsScript('updateLink', linkData);
};
export const deleteLink = async (linkId: string): Promise<{ success: boolean }> => {
  return callAppsScript('deleteLink', linkId);
};

// --- PROMPTS API ---
export const getPromptsByProjectId = async (projectId: string): Promise<Prompt[]> => {
  return callAppsScript('getPromptsByProjectId', projectId);
};
export const addPrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt> => {
  return callAppsScript('addPrompt', promptData);
};
export const updatePrompt = async (promptData: Prompt): Promise<Prompt> => {
  return callAppsScript('updatePrompt', promptData);
};
export const deletePrompt = async (promptId: string): Promise<{ success: boolean }> => {
  return callAppsScript('deletePrompt', promptId);
};

// --- BOTS API ---
export const getBots = async (): Promise<Bot[]> => {
  return callAppsScript('getBots');
};

export const addBot = async (botData: Omit<Bot, 'id' | 'createdAt' | 'status' | 'updatedAt' | 'onlineSince' | 'lastOnlineDuration'>): Promise<Bot> => {
  return callAppsScript('addBot', botData);
};

export const updateBot = async (botData: Bot): Promise<Bot> => {
  return callAppsScript('updateBot', botData);
};

export const deleteBot = async (botId: string): Promise<{ success: boolean }> => {
  return callAppsScript('deleteBot', botId);
};

export const connectBot = async (botId: string): Promise<{ success: boolean }> => {
    return callAppsScript('connectBot', botId);
};

export const disconnectBot = async (botId: string): Promise<{ success: boolean }> => {
    return callAppsScript('disconnectBot', botId);
};

export const getBotQrCode = async (builderBotId: string): Promise<{ qr: string }> => {
    return callAppsScript('getBotQrCode', builderBotId);
};

export const getBotFlows = async (builderBotId: string): Promise<Flow[]> => {
    return callAppsScript('getBotFlows', builderBotId);
};