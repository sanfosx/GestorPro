
import React, { useState } from 'react';
import type { Bot } from '../types';

const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const BotForm: React.FC<{
  bot: Partial<Bot> | null;
  onSave: (bot: Omit<Bot, 'id' | 'createdAt'> | Bot) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}> = ({ bot, onSave, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemInstruction: '',
    id_builderBot: '',
    builderBotApiKey: '',
    ...bot,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.systemInstruction) {
      alert('Por favor, complete el nombre y el prompt del sistema.');
      return;
    }
    onSave(formData as Bot);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Bot</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción Breve</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>
       <div>
        <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-700">Prompt del Sistema (Persona)</label>
        <textarea name="systemInstruction" id="systemInstruction" value={formData.systemInstruction} onChange={handleChange} required rows={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 font-mono" placeholder="Ej: Eres un asistente útil que responde de forma concisa." />
      </div>
      <div>
        <label htmlFor="id_builderBot" className="block text-sm font-medium text-gray-700">ID de BuilderBot</label>
        <input type="text" name="id_builderBot" id="id_builderBot" value={formData.id_builderBot} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 font-mono" placeholder="ID del deploy de BuilderBot (opcional)" />
      </div>
      <div>
        <label htmlFor="builderBotApiKey" className="block text-sm font-medium text-gray-700">Clave API de BuilderBot</label>
        <input 
            type="text" 
            name="builderBotApiKey" 
            id="builderBotApiKey" 
            value={formData.builderBotApiKey || ''}
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 font-mono" 
            placeholder="bbc-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
      </div>
      <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-[120px] disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {isSubmitting ? <SpinnerIcon /> : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default BotForm;