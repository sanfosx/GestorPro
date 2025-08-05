import React, { useState } from 'react';
import { getClientByPhone } from '../services/api';
import type { Client } from '../types';

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
);

const ClientSearch: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [foundClient, setFoundClient] = useState<Client | null | undefined>(undefined); // undefined: initial, null: not found
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
        setError('Por favor, ingresa un número de teléfono.');
        return;
    }
    setIsLoading(true);
    setError(null);
    setFoundClient(undefined);

    try {
      const client = await getClientByPhone(phone);
      setFoundClient(client);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      setFoundClient(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Buscar Cliente por Teléfono</h2>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:flex-grow">
            <label htmlFor="search-phone" className="sr-only">Número de teléfono</label>
            <input
            type="tel"
            id="search-phone"
            value={phone}
            onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
            }}
            placeholder="Ingresa el número de teléfono"
            className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-shrink-0 w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center disabled:bg-indigo-400"
        >
          {isLoading ? <Spinner /> : <i className="fas fa-search mr-2"></i>}
          <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-6">
        {foundClient === undefined && (
          <p className="text-gray-500">Ingresa un teléfono para iniciar la búsqueda.</p>
        )}
        {foundClient === null && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
            <p className="font-bold">No encontrado</p>
            <p>No se encontró ningún cliente con el teléfono "{phone}".</p>
          </div>
        )}
        {foundClient && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <h3 className="text-lg font-semibold text-green-800">Cliente Encontrado</h3>
             <div className="mt-2 text-sm text-green-900 space-y-1">
                <p><strong>Nombre:</strong> {foundClient.name}</p>
                <p><strong>Contacto:</strong> {foundClient.contactPerson}</p>
                <p><strong>Email:</strong> {foundClient.email}</p>
                <p><strong>Teléfono:</strong> {foundClient.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSearch;