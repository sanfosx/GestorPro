import React, { useState, useEffect, useCallback } from 'react';
import { getPromptsByProjectId, addPrompt, updatePrompt, deletePrompt } from '../services/api';
import type { Prompt } from '../types';
import ConfirmationDialog from './ConfirmationDialog';

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>;

const sortPrompts = (prompts: Prompt[]) => {
  return [...prompts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

const PromptManager: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>({ prompt: '', response: ''});
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPromptsByProjectId(projectId);
      setPrompts(sortPrompts(data));
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPrompt?.prompt) return;
    setIsSubmitting(true);
    try {
      if (editingPrompt.id) {
        const updated = await updatePrompt(editingPrompt as Prompt);
        setPrompts(prev => sortPrompts(prev.map(p => p.id === updated.id ? updated : p)));
      } else {
        const newPrompt = await addPrompt({ ...editingPrompt, projectId } as Omit<Prompt, 'id' | 'createdAt'>);
        setPrompts(prev => sortPrompts([...prev, newPrompt]));
      }
      setEditingPrompt({ prompt: '', response: '' });
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('No se pudo guardar el prompt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (promptId: string) => {
    setPromptToDelete(promptId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!promptToDelete) return;

    setIsDeleting(true);
    const originalPrompts = prompts;
    setPrompts(prompts.filter(p => p.id !== promptToDelete)); // Optimistic update

    try {
      await deletePrompt(promptToDelete);
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('No se pudo eliminar el prompt. La interfaz ha sido restaurada.');
      setPrompts(originalPrompts); // Revert
    } finally {
      setIsDeleting(false);
      setIsConfirmDialogOpen(false);
      setPromptToDelete(null);
    }
  };

  const handleTogglePin = async (promptToToggle: Prompt) => {
    const originalPrompts = prompts;
    const updatedPrompt = { ...promptToToggle, isPinned: !promptToToggle.isPinned };
    
    // Optimistic update
    const optimisticallyUpdatedPrompts = prompts.map(p => p.id === promptToToggle.id ? updatedPrompt : p);
    setPrompts(sortPrompts(optimisticallyUpdatedPrompts));

    try {
      await updatePrompt(updatedPrompt);
    } catch (error) {
      console.error('Error toggling pin status, reverting.', error);
      alert('No se pudo actualizar el estado del prompt. La interfaz ha sido restaurada.');
      setPrompts(originalPrompts); // Revert
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">{editingPrompt?.id ? 'Editar Prompt' : 'Añadir Nuevo Prompt'}</h3>
        <textarea
          placeholder="Escribe aquí tu prompt..."
          value={editingPrompt?.prompt || ''}
          onChange={e => setEditingPrompt(prev => ({ ...prev, prompt: e.target.value }))}
          className="w-full p-2 border rounded-md font-mono text-sm"
          rows={3}
          required
        />
        <textarea
          placeholder="Pega aquí la respuesta de la IA..."
          value={editingPrompt?.response || ''}
          onChange={e => setEditingPrompt(prev => ({ ...prev, response: e.target.value }))}
          className="w-full p-2 border rounded-md font-mono text-sm"
          rows={6}
        />
        <div className="flex justify-end space-x-2">
          {editingPrompt?.id && <button type="button" onClick={() => setEditingPrompt({ prompt: '', response: '' })} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium">Cancelar Edición</button>}
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium disabled:bg-indigo-400">
            {isSubmitting ? 'Guardando...' : (editingPrompt?.id ? 'Actualizar Prompt' : 'Guardar Prompt')}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {prompts.map(p => (
          <details key={p.id} className={`bg-white border rounded-lg overflow-hidden ${p.isPinned ? 'border-indigo-300 shadow-sm' : 'border-gray-200'}`}>
            <summary className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 list-none">
              <div className="flex-grow min-w-0">
                <p className="font-semibold text-gray-800 truncate pr-4">{p.prompt}</p>
              </div>
              <div className="flex space-x-3 flex-shrink-0 items-center pl-2">
                <button onClick={(e) => { e.preventDefault(); handleTogglePin(p); }} className={`transition-colors ${p.isPinned ? 'text-indigo-600 hover:text-indigo-500' : 'text-gray-400 hover:text-indigo-600'}`} title={p.isPinned ? 'Desfijar' : 'Fijar'}>
                    <i className="fas fa-thumbtack"></i>
                </button>
                <button onClick={(e) => { e.preventDefault(); setEditingPrompt(p); window.scrollTo(0, 0); }} className="text-blue-500 hover:text-blue-700"><i className="fas fa-pencil-alt"></i></button>
                <button onClick={(e) => { e.preventDefault(); handleDeleteRequest(p.id); }} className="text-red-500 hover:text-red-700"><i className="fas fa-trash-alt"></i></button>
                <span className="text-gray-400 select-none">▼</span>
              </div>
            </summary>
            <div className="p-4 border-t bg-gray-50">
              <h5 className="font-semibold text-gray-600 mb-2">Respuesta:</h5>
              <pre className="whitespace-pre-wrap bg-white p-3 rounded text-sm font-mono text-gray-700">{p.response || 'Sin respuesta guardada.'}</pre>
            </div>
          </details>
        ))}
        {prompts.length === 0 && <p className="text-center text-gray-500 py-4">No hay prompts para este proyecto.</p>}
      </div>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este prompt? Esta acción no se puede deshacer."
        isLoading={isDeleting}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
};

export default PromptManager;