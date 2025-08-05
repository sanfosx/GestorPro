import React, { useState, useEffect, useCallback } from 'react';
import { getLinksByProjectId, addLink, updateLink, deleteLink } from '../services/api';
import type { Link } from '../types';
import ConfirmationDialog from './ConfirmationDialog';

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>;

const sortLinks = (links: Link[]) => {
  return [...links].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

const LinkManager: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<Link> | null>({ url: '', description: '' });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLinksByProjectId(projectId);
      setLinks(sortLinks(data));
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLink?.url) return;
    setIsSubmitting(true);
    try {
      if (editingLink.id) {
        const updated = await updateLink(editingLink as Link);
        setLinks(prev => sortLinks(prev.map(l => l.id === updated.id ? updated : l)));
      } else {
        const newLink = await addLink({ ...editingLink, projectId } as Omit<Link, 'id' | 'createdAt'>);
        setLinks(prev => sortLinks([...prev, newLink]));
      }
      setEditingLink({ url: '', description: '' });
    } catch (error) {
      console.error('Error saving link:', error);
      alert('No se pudo guardar el enlace.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteRequest = (linkId: string) => {
    setLinkToDelete(linkId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;

    setIsDeleting(true);
    const originalLinks = links;
    setLinks(links.filter(l => l.id !== linkToDelete)); // Optimistic update

    try {
      await deleteLink(linkToDelete);
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('No se pudo eliminar el enlace. La interfaz ha sido restaurada.');
      setLinks(originalLinks); // Revert
    } finally {
      setIsDeleting(false);
      setIsConfirmDialogOpen(false);
      setLinkToDelete(null);
    }
  };
  
  const handleTogglePin = async (linkToToggle: Link) => {
    const originalLinks = links;
    const updatedLink = { ...linkToToggle, isPinned: !linkToToggle.isPinned };
    
    // Optimistic update
    const optimisticallyUpdatedLinks = links.map(l => l.id === linkToToggle.id ? updatedLink : l);
    setLinks(sortLinks(optimisticallyUpdatedLinks));

    try {
      await updateLink(updatedLink);
    } catch (error) {
      console.error('Error toggling pin status, reverting.', error);
      alert('No se pudo actualizar el estado del enlace. La interfaz ha sido restaurada.');
      setLinks(originalLinks); // Revert
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">{editingLink?.id ? 'Editar Link' : 'Añadir Nuevo Link'}</h3>
        <input
          type="url"
          placeholder="https://ejemplo.com"
          value={editingLink?.url || ''}
          onChange={e => setEditingLink(prev => ({ ...prev, url: e.target.value }))}
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={editingLink?.description || ''}
          onChange={e => setEditingLink(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 border rounded-md"
        />
        <div className="flex justify-end space-x-2">
          {editingLink?.id && <button type="button" onClick={() => setEditingLink({ url: '', description: '' })} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium">Cancelar Edición</button>}
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium disabled:bg-indigo-400">
            {isSubmitting ? 'Guardando...' : (editingLink?.id ? 'Actualizar Link' : 'Guardar Link')}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {links.map(link => (
          <div key={link.id} className={`bg-white p-3 rounded-lg border flex justify-between items-center ${link.isPinned ? 'border-indigo-300 shadow-sm' : 'border-gray-200'}`}>
            <div className="truncate min-w-0">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline truncate block">{link.url}</a>
              <p className="text-sm text-gray-600 truncate">{link.description}</p>
            </div>
            <div className="flex space-x-3 flex-shrink-0 ml-4 items-center">
              <button onClick={() => handleTogglePin(link)} className={`transition-colors ${link.isPinned ? 'text-indigo-600 hover:text-indigo-500' : 'text-gray-400 hover:text-indigo-600'}`} title={link.isPinned ? 'Desfijar' : 'Fijar'}>
                  <i className="fas fa-thumbtack"></i>
              </button>
              <button onClick={() => setEditingLink(link)} className="text-blue-500 hover:text-blue-700"><i className="fas fa-pencil-alt"></i></button>
              <button onClick={() => handleDeleteRequest(link.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash-alt"></i></button>
            </div>
          </div>
        ))}
        {links.length === 0 && <p className="text-center text-gray-500 py-4">No hay enlaces para este proyecto.</p>}
      </div>
      
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este enlace? Esta acción no se puede deshacer."
        isLoading={isDeleting}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
};

export default LinkManager;