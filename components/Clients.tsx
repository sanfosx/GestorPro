import React, { useState, useEffect, useCallback } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '../services/api';
import type { Client } from '../types';
import Modal from './Modal';
import Header from './Header';
import ClientForm from './ClientForm';
import ConfirmationDialog from './ConfirmationDialog';
import ClientSearch from './ClientSearch';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const fetchClientsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchClientsData();
  }, [fetchClientsData]);

  const handleOpenModal = (client: Partial<Client> | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveClient = async (clientData: any) => {
    setIsSubmitting(true);
    try {
      if (editingClient && 'id' in editingClient) {
        await updateClient({ ...editingClient, ...clientData });
      } else {
        await addClient(clientData);
      }
      fetchClientsData();
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setClientToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteClient(clientToDelete);
        fetchClientsData();
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
    } finally {
        setIsSubmitting(false);
        setIsConfirmDialogOpen(false);
        setClientToDelete(null);
    }
  };

  return (
    <div>
      <Header title="Clientes" subtitle="Gestiona tu cartera de clientes" buttonText="Nuevo Cliente" onButtonClick={() => handleOpenModal()} />

      <ClientSearch />

      <div className="mt-8 pt-6 border-t">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Listado de Clientes</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                  <div key={client.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between transition-transform transform hover:-translate-y-1">
                      <div>
                          <h3 className="text-xl font-bold text-gray-800">{client.name}</h3>
                          <p className="text-gray-600">{client.contactPerson}</p>
                      </div>
                      <div className="my-4 text-sm text-gray-500 space-y-2">
                          <p className="flex items-center"><i className="fas fa-envelope mr-2 text-indigo-500"></i> {client.email}</p>
                          <p className="flex items-center"><i className="fas fa-phone mr-2 text-indigo-500"></i> {client.phone}</p>
                      </div>
                      <div className="flex justify-end space-x-3 mt-2 border-t pt-4">
                          <button onClick={() => handleOpenModal(client)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">EDITAR</button>
                          <button onClick={() => handleDeleteRequest(client.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">ELIMINAR</button>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingClient ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
      >
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este cliente? Esta acción también eliminará todos sus proyectos asociados y no se puede deshacer."
        isLoading={isSubmitting}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
};

export default Clients;