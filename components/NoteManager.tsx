import React, { useState, useEffect, useCallback } from 'react';
import { getNotesByProjectId, addNote, updateNote, deleteNote } from '../services/api';
import type { Note } from '../types';
import ConfirmationDialog from './ConfirmationDialog';

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>;

const sortNotes = (notes: Note[]) => {
  return [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

const NoteManager: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotesByProjectId(projectId);
      setNotes(sortNotes(data));
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingNote?.title || !editingNote?.content) return;
    setIsSubmitting(true);
    try {
      if (editingNote.id) {
        const updated = await updateNote(editingNote as Note);
        setNotes(prev => sortNotes(prev.map(n => n.id === updated.id ? updated : n)));
      } else {
        const newNote = await addNote({ ...editingNote, projectId } as Omit<Note, 'id' | 'createdAt'>);
        setNotes(prev => sortNotes([...prev, newNote]));
      }
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('No se pudo guardar la nota.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteRequest = (noteId: string) => {
    setNoteToDelete(noteId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;

    setIsDeleting(true);
    const originalNotes = notes;
    const newNotes = notes.filter(n => n.id !== noteToDelete);
    setNotes(newNotes); // Optimistic update

    try {
      await deleteNote(noteToDelete);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('No se pudo eliminar la nota. La interfaz ha sido restaurada.');
      setNotes(originalNotes); // Revert on failure
    } finally {
      setIsDeleting(false);
      setIsConfirmDialogOpen(false);
      setNoteToDelete(null);
    }
  };
  
  const handleTogglePin = async (noteToToggle: Note) => {
    const originalNotes = notes;
    const updatedNote = { ...noteToToggle, isPinned: !noteToToggle.isPinned };
    
    // Optimistic update
    const optimisticallyUpdatedNotes = notes.map(n => n.id === noteToToggle.id ? updatedNote : n);
    setNotes(sortNotes(optimisticallyUpdatedNotes));

    try {
      await updateNote(updatedNote);
    } catch (error) {
      console.error('Error toggling pin status, reverting.', error);
      alert('No se pudo actualizar el estado de la nota. La interfaz ha sido restaurada.');
      setNotes(originalNotes); // Revert on failure
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">{editingNote?.id ? 'Editar Nota' : 'Añadir Nueva Nota'}</h3>
        <input
          type="text"
          placeholder="Título de la nota"
          value={editingNote?.title || ''}
          onChange={e => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded-md"
          required
        />
        <textarea
          placeholder="Contenido de la nota..."
          value={editingNote?.content || ''}
          onChange={e => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
          className="w-full p-2 border rounded-md"
          rows={4}
          required
        />
        <div className="flex justify-end space-x-2">
          {editingNote && <button type="button" onClick={() => setEditingNote(null)} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium">Cancelar</button>}
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium disabled:bg-indigo-400">
            {isSubmitting ? 'Guardando...' : (editingNote?.id ? 'Actualizar Nota' : 'Guardar Nota')}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {notes.map(note => (
          <div key={note.id} className={`bg-white p-4 rounded-lg border ${note.isPinned ? 'border-indigo-300 shadow-sm' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-800">{note.title}</h4>
                <p className="text-xs text-gray-500">Creado: {new Date(note.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex space-x-3 items-center">
                <button onClick={() => handleTogglePin(note)} className={`transition-colors ${note.isPinned ? 'text-indigo-600 hover:text-indigo-500' : 'text-gray-400 hover:text-indigo-600'}`} title={note.isPinned ? 'Desfijar' : 'Fijar'}>
                    <i className="fas fa-thumbtack"></i>
                </button>
                <button onClick={() => setEditingNote(note)} className="text-blue-500 hover:text-blue-700"><i className="fas fa-pencil-alt"></i></button>
                <button onClick={() => handleDeleteRequest(note.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-center text-gray-500 py-4">No hay notas para este proyecto.</p>}
      </div>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer."
        isLoading={isDeleting}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
};

export default NoteManager;