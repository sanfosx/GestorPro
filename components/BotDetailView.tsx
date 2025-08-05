
import React, { useState, useEffect } from 'react';
import type { Bot, Flow } from '../types';
import { connectBot, disconnectBot, getBotQrCode, getBotFlows } from '../services/api';
import Modal from './Modal';

const getBotDisplayInfo = (status: string | undefined): { label: string; iconColor: string } => {
    const upperStatus = status?.toUpperCase();
    let label = status || 'Desconocido';
    let iconColor = 'text-indigo-500';

    switch (upperStatus) {
        case 'ONLINE':
        case 'ACTIVE':
            label = 'En linea';
            iconColor = 'text-green-500';
            break;
        case 'NOT_FOUND':
            label = 'Sin conexion';
            iconColor = 'text-red-500';
            break;
        case 'FAILED':
            label = 'Fallido';
            iconColor = 'text-red-500';
            break;
        case 'ERROR':
            label = 'Error';
            iconColor = 'text-red-500';
            break;
        case 'IN_PROGRESS':
            label = 'En Progreso';
            iconColor = 'text-blue-500';
            break;
        case 'PENDING SYNC':
             label = 'Sincronizando';
             iconColor = 'text-gray-500';
             break;
        case 'CONNECTING':
             label = 'Conectando...';
             iconColor = 'text-blue-500';
             break;
        case 'READY_TO_SCAN':
             label = 'Listo para escanear';
             iconColor = 'text-purple-500';
             break;
        case 'DISCONNECTING':
            label = 'Apagando...';
            iconColor = 'text-yellow-500';
            break;
    }
    return { label, iconColor };
};

const formatTimer = (ms: number): string => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const OnlineTimer: React.FC<{ onlineSince: string }> = ({ onlineSince }) => {
    const [duration, setDuration] = useState(Date.now() - new Date(onlineSince).getTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(Date.now() - new Date(onlineSince).getTime());
        }, 1000);

        return () => clearInterval(timer);
    }, [onlineSince]);

    return <>{formatTimer(duration)}</>;
};

const SpinnerIcon: React.FC<{className?: string}> = ({ className='' }) => (
    <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const BotDetailView: React.FC<{
  bot: Bot;
  onClose: () => void;
  onRefresh: () => void;
}> = ({ bot, onClose, onRefresh }) => {
  const { label: statusLabel, iconColor } = getBotDisplayInfo(bot.status);
  const isOnline = bot.status?.toUpperCase() === 'ONLINE' || bot.status?.toUpperCase() === 'ACTIVE';
  const isReadyToScan = bot.status?.toUpperCase() === 'READY_TO_SCAN';
  const isTransitioning = ['CONNECTING', 'DISCONNECTING', 'PENDING SYNC'].includes(bot.status?.toUpperCase() || '');
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(false);

  const [isFlowsModalOpen, setIsFlowsModalOpen] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isFlowsLoading, setIsFlowsLoading] = useState(false);
  const [flowsError, setFlowsError] = useState<string | null>(null);
  const [expandedFlowId, setExpandedFlowId] = useState<string | null>(null);

  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [prompts, setPrompts] = useState<{ flowName: string; prompt: string }[]>([]);
  const [isPromptsLoading, setIsPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQr = async () => {
      if (isReadyToScan && bot.id_builderBot) {
        setIsQrLoading(true);
        setQrCode(null);
        try {
          const data = await getBotQrCode(bot.id_builderBot);
          setQrCode(data.qr);
        } catch (error) {
          console.error("Error al obtener el código QR:", error);
          alert('No se pudo generar el código QR. Inténtalo de nuevo más tarde.');
        } finally {
          setIsQrLoading(false);
        }
      }
    };
    fetchQr();
  }, [bot.status, bot.id_builderBot, isReadyToScan]);

  const handleConnect = async () => {
      if (!bot.id_builderBot) {
        alert("Este bot no tiene un ID de BuilderBot asignado.");
        return;
      }
      setIsActionLoading(true);
      try {
        await connectBot(bot.id);
        onRefresh();
      } catch (error) {
        console.error("Error al conectar el bot:", error);
        alert(`Error al conectar el bot: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsActionLoading(false);
      }
  };

  const handleDisconnect = async () => {
      if (!bot.id_builderBot) {
        alert("Este bot no tiene un ID de BuilderBot asignado.");
        return;
      }
      setIsActionLoading(true);
      try {
        await disconnectBot(bot.id);
        onRefresh();
      } catch (error) {
        console.error("Error al apagar el bot:", error);
        alert(`Error al apagar el bot: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsActionLoading(false);
      }
  };

  const handleViewFlows = async () => {
    if (!bot.id_builderBot) {
      alert("Este bot no tiene un ID de BuilderBot asignado.");
      return;
    }
    setIsFlowsModalOpen(true);
    setIsFlowsLoading(true);
    setFlowsError(null);
    setFlows([]);
    try {
      const flowsData = await getBotFlows(bot.id_builderBot);
      setFlows(flowsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error al obtener los flujos:", errorMessage);
      setFlowsError(`No se pudieron obtener los flujos: ${errorMessage}`);
    } finally {
      setIsFlowsLoading(false);
    }
  };

  const handleViewPrompts = async () => {
    if (!bot.id_builderBot) {
        alert("Este bot no tiene un ID de BuilderBot asignado.");
        return;
    }
    setIsPromptsModalOpen(true);
    setIsPromptsLoading(true);
    setPromptsError(null);
    setPrompts([]);

    try {
        const flowsData = await getBotFlows(bot.id_builderBot);
        const extractedPrompts: { flowName: string, prompt: string }[] = [];
        
        flowsData.forEach(flow => {
            flow.answers.forEach(answer => {
                if (answer.plugins?.openai?.assistantInstructions) {
                    extractedPrompts.push({
                        flowName: flow.name,
                        prompt: answer.plugins.openai.assistantInstructions
                    });
                }
            });
        });

        setPrompts(extractedPrompts);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error al obtener los prompts:", errorMessage);
        setPromptsError(`No se pudieron obtener los prompts: ${errorMessage}`);
    } finally {
        setIsPromptsLoading(false);
    }
  };

  return (
    <>
    <div className="bg-white h-full rounded-xl shadow-lg flex flex-col animate-slide-in-from-right">
        <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
            <div className="flex-grow min-w-0">
                <h2 className="text-xl font-bold text-gray-800 flex items-center" title={bot.name}>
                  <i className={`fas fa-robot mr-3 ${iconColor}`}></i>
                  <span className="truncate">{bot.name}</span>
                </h2>
                <p className="text-sm text-gray-500 md:ml-9 mt-1 truncate" title={bot.description}>{bot.description}</p>
            </div>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar vista de detalles"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </header>

        <div className="p-4 border-b">
            <h3 className="text-base font-semibold text-gray-700 mb-3">Acciones</h3>
            <div className="space-y-2">
                {isReadyToScan ? (
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                        {isQrLoading ? (
                            <div className="flex flex-col items-center justify-center space-y-2 h-48">
                                <SpinnerIcon className="text-indigo-500 h-8 w-8" />
                                <span className="text-sm font-medium text-gray-600">Generando código QR...</span>
                            </div>
                        ) : qrCode ? (
                            <div className="flex flex-col items-center">
                                <p className="text-sm text-gray-700 mb-3">Escanea el código para conectar tu dispositivo.</p>
                                <img src={qrCode} alt="Código QR para conectar el bot" className="w-48 h-48 rounded-md shadow-md" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48">
                                <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                                <p className="text-sm text-red-600">No se pudo cargar el código QR.</p>
                            </div>
                        )}
                    </div>
                ) : isOnline ? (
                    <button
                        onClick={handleDisconnect}
                        disabled={isActionLoading || isTransitioning}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                        {isActionLoading ? <SpinnerIcon className="text-white" /> : <i className="fas fa-power-off mr-2"></i>}
                        {isActionLoading ? 'Apagando...' : 'Apagar'}
                    </button>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={isActionLoading || isTransitioning || !bot.id_builderBot}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                        {isActionLoading ? <SpinnerIcon className="text-white" /> : <i className="fas fa-play mr-2"></i>}
                        {isActionLoading ? 'Conectando...' : 'Conectar'}
                    </button>
                )}
                 <button
                    onClick={handleViewFlows}
                    disabled={isActionLoading || isTransitioning || !bot.id_builderBot}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                    <i className="fas fa-sitemap mr-2"></i>
                    Ver Flujos
                </button>
                <button
                    onClick={handleViewPrompts}
                    disabled={isActionLoading || isTransitioning || !bot.id_builderBot}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                    <i className="fas fa-comment-dots mr-2"></i>
                    Ver Prompts
                </button>
            </div>
        </div>
        
        <main className="p-4 md:p-6 overflow-y-auto flex-grow bg-gray-50/50 rounded-b-xl space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">Prompt del Sistema</h3>
              <div className="bg-slate-800 text-slate-200 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap shadow-inner max-h-96 overflow-y-auto">
                {bot.systemInstruction}
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">Detalles</h3>
              <div className="bg-white border border-gray-200 p-4 rounded-lg text-sm space-y-3">
                 <div>
                  <strong className="font-medium text-gray-600 block">Estado</strong>
                  <span className="text-gray-700">{statusLabel}</span>
                </div>
                 <div>
                    <strong className="font-medium text-gray-600 block">
                        {isOnline ? 'Tiempo en línea' : 'Última duración activo'}
                    </strong>
                    <span className="text-gray-700 font-mono">
                        {isOnline && bot.onlineSince ? (
                        <OnlineTimer onlineSince={bot.onlineSince} />
                        ) : !isOnline && bot.lastOnlineDuration ? (
                        bot.lastOnlineDuration
                        ) : (
                        'N/A'
                        )}
                    </span>
                 </div>
                <div>
                  <strong className="font-medium text-gray-600 block">ID de BuilderBot</strong>
                  <span className="text-gray-500 break-all font-mono">{bot.id_builderBot || 'No asignado'}</span>
                </div>
                <div>
                  <strong className="font-medium text-gray-600 block">ID del Bot</strong>
                  <span className="text-gray-500 break-all">{bot.id}</span>
                </div>
                <div>
                  <strong className="font-medium text-gray-600 block">Fecha de Creación</strong>
                  <span className="text-gray-500">{new Date(bot.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <strong className="font-medium text-gray-600 block">Última Sincronización</strong>
                  <span className="text-gray-500">{bot.updatedAt ? new Date(bot.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>
        </main>
    </div>
    <Modal
        isOpen={isFlowsModalOpen}
        onClose={() => setIsFlowsModalOpen(false)}
        title={`Flujos de: ${bot.name}`}
      >
        {isFlowsLoading ? (
          <div className="flex justify-center items-center h-64">
            <SpinnerIcon className="text-indigo-500 h-8 w-8" />
          </div>
        ) : flowsError ? (
          <div className="text-center p-4 bg-red-50 text-red-700 rounded-lg">
            <p className="font-bold">Error</p>
            <p>{flowsError}</p>
          </div>
        ) : flows.length > 0 ? (
          <div className="space-y-2">
            {flows.map(flow => (
              <div key={flow.id} className="border rounded-lg overflow-hidden">
                <div className="p-3 flex justify-between items-center bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800">{flow.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{flow.id}</p>
                  </div>
                  <button
                    onClick={() => setExpandedFlowId(expandedFlowId === flow.id ? null : flow.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {expandedFlowId === flow.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                  </button>
                </div>
                {expandedFlowId === flow.id && (
                  <div className="p-3 border-t bg-slate-900 text-slate-200">
                    <pre className="text-xs whitespace-pre-wrap font-mono max-h-96 overflow-auto">
                      {JSON.stringify(flow, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 p-4">Este bot no tiene flujos configurados.</p>
        )}
      </Modal>

      <Modal
        isOpen={isPromptsModalOpen}
        onClose={() => setIsPromptsModalOpen(false)}
        title={`Prompts de Sistema de: ${bot.name}`}
      >
        {isPromptsLoading ? (
          <div className="flex justify-center items-center h-64">
            <SpinnerIcon className="text-indigo-500 h-8 w-8" />
          </div>
        ) : promptsError ? (
          <div className="text-center p-4 bg-red-50 text-red-700 rounded-lg">
            <p className="font-bold">Error</p>
            <p>{promptsError}</p>
          </div>
        ) : prompts.length > 0 ? (
          <div className="space-y-4">
            {prompts.map((p, index) => (
              <div key={index} className="border rounded-lg bg-gray-50">
                <div className="p-3 border-b bg-gray-100">
                    <p className="font-semibold text-gray-800">Prompt en flujo: "{p.flowName}"</p>
                </div>
                <div className="p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-slate-700">
                      {p.prompt}
                    </pre>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 p-4">No se encontraron prompts de sistema en los flujos de este bot.</p>
        )}
      </Modal>
    </>
  );
};

export default BotDetailView;
