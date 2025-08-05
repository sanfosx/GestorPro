import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBots, addBot, updateBot, deleteBot } from '../services/api';
import type { Bot } from '../types';
import Modal from './Modal';
import Header from './Header';
import BotForm from './BotForm';
import ConfirmationDialog from './ConfirmationDialog';
import BotCard from './BotCard';
import BotDetailView from './BotDetailView';

const Bots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Partial<Bot> | null>(null);
  const [botToDelete, setBotToDelete] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  const selectedBotRef = useRef(selectedBot);
  selectedBotRef.current = selectedBot;

  const fetchAndProcessBots = useCallback(async (isInitialLoad: boolean) => {
    if (isInitialLoad) setLoading(true);
    try {
      const data = await getBots();
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBots(sorted);

      const currentSelectedBot = selectedBotRef.current;
      if (currentSelectedBot) {
        const updatedSelectedBot = sorted.find(b => b.id === currentSelectedBot.id);
        setSelectedBot(updatedSelectedBot || null);
      }
    } catch (error) {
      console.error("Error al refrescar bots:", error);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndProcessBots(true); // Carga inicial

    const intervalId = setInterval(() => {
      fetchAndProcessBots(false); // Sondeo en segundo plano
    }, 5000); // Cada 5 segundos

    return () => clearInterval(intervalId); // Limpiar al desmontar
  }, [fetchAndProcessBots]);

  const handleOpenModal = (bot: Partial<Bot> | null = null) => {
    setSelectedBot(null);
    setEditingBot(bot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBot(null);
  };

  const handleSelectBot = (bot: Bot) => {
    if(isModalOpen) return;
    setSelectedBot(bot);
  }

  const handleSaveBot = async (botData: any) => {
    setIsSubmitting(true);
    try {
      if (editingBot && 'id' in editingBot) {
        const botToUpdate = { ...editingBot, ...botData };
        const savedBot = await updateBot(botToUpdate as Bot);
        setBots(prev => prev.map(b => b.id === savedBot.id ? savedBot : b));
        if (selectedBot?.id === savedBot.id) {
          setSelectedBot(savedBot);
        }
      } else {
        const newBot = await addBot(botData);
        setBots(prev => [newBot, ...prev]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar bot:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setBotToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!botToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteBot(botToDelete);
        setBots(prev => prev.filter(b => b.id !== botToDelete));
        if (selectedBot?.id === botToDelete) {
          setSelectedBot(null);
        }
    } catch (error) {
        console.error("Error al eliminar bot:", error);
    } finally {
        setIsSubmitting(false);
        setIsConfirmDialogOpen(false);
        setBotToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8">
      <div className={`${selectedBot ? 'hidden md:block md:col-span-8 lg:col-span-7' : 'col-span-12'}`}>
        <Header title="Bots" subtitle="Administra tus asistentes de IA" buttonText="Nuevo Bot" onButtonClick={() => handleOpenModal()} />

        {loading ? (
          <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {bots.map(bot => (
                  <BotCard 
                    key={bot.id}
                    bot={bot}
                    isSelected={selectedBot?.id === bot.id}
                    onSelect={handleSelectBot}
                    onEdit={handleOpenModal}
                    onDelete={handleDeleteRequest}
                  />
              ))}
          </div>
        )}
      </div>

      {selectedBot && (
        <aside className="md:col-span-4 lg:col-span-5">
             <div className="md:sticky md:top-8 md:h-[calc(100vh-4rem)]"> 
                <BotDetailView 
                    bot={selectedBot} 
                    onClose={() => setSelectedBot(null)} 
                    onRefresh={() => fetchAndProcessBots(false)}
                />
            </div>
        </aside>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingBot && editingBot.id ? 'Editar Bot' : 'Crear Nuevo Bot'}
      >
        <BotForm
          bot={editingBot}
          onSave={handleSaveBot}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este bot? Esta acción no se puede deshacer."
        isLoading={isSubmitting}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
};

export default Bots;