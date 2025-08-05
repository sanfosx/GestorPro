import React, { useState } from 'react';
import { AUTH_SCRIPT_URL } from '../config';

// La URL ahora se gestiona a través de variables de entorno,
// leídas por el archivo `config.ts`.

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

interface AuthProps {
    onLoginSuccess: (session: { id_sheet: string }) => void;
}

type AuthStage = 'login' | 'verify' | 'register';

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [stage, setStage] = useState<AuthStage>('login');
    const [identifier, setIdentifier] = useState('');
    const [token, setToken] = useState('');
    const [formData, setFormData] = useState({
        Nombre: '',
        Apellido: '',
        WhatsApp: '',
        Email: '',
        FechaNacimiento: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const callAuthScript = async (action: string, payload: any) => {
        // La verificación de la URL ahora se hace en config.ts al iniciar la app.
        // Esto asegura que la app no se ejecute con una configuración inválida.

        setIsLoading(true);
        setError(null);
        setMessage(null);
        try {
            const res = await fetch(AUTH_SCRIPT_URL, {
                method: 'POST',
                // Se omite la cabecera 'Content-Type' a propósito.
                // Al enviar un string en el body, el navegador usará por defecto
                // 'text/plain', lo que evita una solicitud de "pre-vuelo" (preflight) de CORS
                // y es más compatible con Google Apps Script.
                body: JSON.stringify({ action, payload }),
                redirect: 'follow'
            });
            const textResponse = await res.text();
            
            if (!textResponse) {
                throw new Error('Respuesta vacía del servidor de autenticación. Revisa los logs del script.');
            }

            const response = JSON.parse(textResponse);

            if (!response.success) {
                throw new Error(response.error || 'Ocurrió un error desconocido en el script de autenticación.');
            }
            return response.data;
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
             if (errorMessage.includes('Failed to fetch') || e instanceof TypeError) {
                const troubleshootingMessage = `
------------------------------------------------------------------------------------
🔴 ERROR DE CONEXIÓN (Failed to fetch) 🔴

Este error casi siempre significa que la aplicación web (frontend) no puede comunicarse con tu script de Google (backend).

PASO DE DIAGNÓSTICO:
1. Copia esta URL: ${AUTH_SCRIPT_URL}
2. Pégala en una nueva pestaña del navegador y presiona Enter.

QUÉ ESPERAR:
- ✅ SI VES UN ERROR que dice "La secuencia de comandos se completó, pero no se devolvió nada", ¡eso es BUENO! Significa que la implementación es correcta y el problema está en otro lugar.
- ❌ SI VES UNA PÁGINA DE ERROR DE GOOGLE (ej. "No se encontró la página", "Necesitas permiso", etc.), el problema está en tu implementación de Google Apps Script.

CÓMO ARREGLARLO:
1. Vuelve a tu proyecto de Apps Script ('script_auth.js').
2. Haz clic en "Implementar" > "Nueva implementación".
3. "Quién tiene acceso" DEBE estar configurado como "Cualquiera".
4. Copia la NUEVA URL de la aplicación web y pégala en la variable VITE_AUTH_SCRIPT_URL dentro de tu archivo '.env' (para desarrollo local) o en la configuración de entorno de tu proveedor de hosting (Netlify, Vercel).

¡RECUERDA! Cada cambio en el código del script requiere una NUEVA implementación.
------------------------------------------------------------------------------------
                `;
                console.error(troubleshootingMessage);
                setError("Error de conexión (Failed to fetch). Revisa la consola (F12) para ver los pasos de diagnóstico.");
            } else {
                setError(errorMessage);
            }
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await callAuthScript('findUser', identifier);
            if (data.userExists) {
                setMessage(data.message);
                setStage('verify');
            } else {
                const isEmail = identifier.includes('@');
                setFormData(prev => ({ 
                    ...prev, 
                    Email: isEmail ? identifier : '',
                    WhatsApp: !isEmail ? identifier : ''
                }));
                setStage('register');
            }
        } catch (e) {
            console.log("Submit-level catch for findUser", e);
        }
    };

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await callAuthScript('verifyToken', { identifier, token });
            if (data.authenticated && data.id_sheet) {
                onLoginSuccess({ id_sheet: data.id_sheet });
            } else {
                setError("La verificación falló. Por favor, inténtelo de nuevo.");
            }
        } catch (e) {
            // El error ya fue manejado y mostrado por callAuthScript
        }
    };
    
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await callAuthScript('registerUser', formData);
            if(data.registrationComplete){
                setMessage(data.message);
                setIdentifier(formData.WhatsApp || formData.Email);
                setStage('verify');
            }
        } catch (e) {
           // El error ya fue manejado y mostrado por callAuthScript
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const renderStage = () => {
        switch (stage) {
            case 'login':
                return (
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-300">WhatsApp o Email</label>
                            <div className="mt-1">
                                <input id="identifier" name="identifier" type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
                                    placeholder="5493624... o tu@email.com"/>
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                                {isLoading ? <Spinner /> : 'Continuar'}
                            </button>
                        </div>
                    </form>
                );
            case 'verify':
                 return (
                    <form onSubmit={handleVerifySubmit} className="space-y-6">
                        <p className="text-center text-sm text-gray-300">Se ha enviado un código de 6 dígitos a <span className="font-bold text-white">{identifier}</span>. Expira en 10 minutos.</p>
                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-300">Código de Verificación</label>
                            <div className="mt-1">
                                <input id="token" name="token" type="text" maxLength={6} required value={token} onChange={e => setToken(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white text-center tracking-[0.5em]"
                                    placeholder="_ _ _ _ _ _"/>
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                                {isLoading ? <Spinner /> : 'Verificar e Ingresar'}
                            </button>
                        </div>
                        <div className="text-center">
                            <button type="button" onClick={() => setStage('login')} className="font-medium text-sm text-indigo-400 hover:text-indigo-300">
                                Usar otro WhatsApp o Email
                            </button>
                        </div>
                    </form>
                );
            case 'register':
                return (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <p className="text-center text-sm text-gray-300">Parece que eres nuevo. ¡Completa tu registro para continuar!</p>
                        {['Nombre', 'Apellido', 'WhatsApp', 'Email', 'FechaNacimiento'].map(field => (
                           <div key={field}>
                             <label htmlFor={field} className="block text-sm font-medium text-gray-300">{field}</label>
                             <input type={field === 'FechaNacimiento' ? 'date' : field === 'Email' ? 'email' : 'text'} 
                                    id={field} name={field} required
                                    value={formData[field as keyof typeof formData]} onChange={handleFormChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" />
                           </div>
                        ))}
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                                {isLoading ? <Spinner /> : 'Registrarme y Enviar Código'}
                            </button>
                        </div>
                    </form>
                );
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                 <h1 className="text-3xl font-bold text-white flex items-center justify-center text-center">
                    <span className="text-indigo-400 mr-2">
                        <i className="fas fa-tasks"></i>
                    </span>
                    <span>GestorPro</span>
                </h1>
                <h2 className="mt-6 text-center text-2xl font-extrabold text-white">
                    {stage === 'login' && 'Inicia sesión en tu cuenta'}
                    {stage === 'verify' && 'Verifica tu identidad'}
                    {stage === 'register' && 'Crea tu cuenta'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    {renderStage()}
                    {error && <p className="mt-4 text-center text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                    {message && !error && <p className="mt-4 text-center text-sm text-green-300">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default Auth;