
import React, { useState, useEffect, useCallback } from 'react';
import { getProjects, addProject, updateProject, deleteProject, getClients } from '../services/api';
import type { Project, Client } from '../types';
import Modal from './Modal';
import Header from './Header';
import ConfirmationDialog from './ConfirmationDialog';
import ProjectForm from './ProjectForm';
import ProjectDetailView from './ProjectDetailView';
import ProjectCard from './ProjectCard';


const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjectsData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsData, clientsData] = await Promise.all([getProjects(), getClients()]);
      const sortedProjects = projectsData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      setProjects(sortedProjects);
      setClients(clientsData);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectsData();
  }, [fetchProjectsData]);

  const handleOpenModal = (project: Partial<Project> | null = null) => {
    setSelectedProject(null); // Close side panel when editing
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSelectProject = (project: Project) => {
    if(isModalOpen) return;
    setSelectedProject(project);
  }

  const handleSaveProject = async (projectData: any) => {
    setIsSubmitting(true);
    try {
      if (editingProject && 'id' in editingProject) {
        await updateProject({ ...editingProject, ...projectData });
      } else {
        await addProject(projectData);
      }
      await fetchProjectsData();
      handleCloseModal();
    } catch(error) {
      console.error("Error al guardar proyecto", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setProjectToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteProject(projectToDelete);
      if (selectedProject?.id === projectToDelete) {
        setSelectedProject(null);
      }
      await fetchProjectsData();
    } catch (error) {
      console.error("Error al eliminar proyecto", error);
    } finally {
      setIsSubmitting(false);
      setIsConfirmDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8">
      <div className={`${selectedProject ? 'hidden md:block md:col-span-8 lg:col-span-7' : 'col-span-12'}`}>
        <Header title="Proyectos" subtitle="Gestiona todos tus proyectos" buttonText="Nuevo Proyecto" onButtonClick={() => handleOpenModal()} />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard 
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onSelect={handleSelectProject}
                onEdit={handleOpenModal}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProject && (
        <aside className="md:col-span-4 lg:col-span-5">
             <div className="md:sticky md:top-8 md:h-[calc(100vh-4rem)]"> 
                <ProjectDetailView 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                />
            </div>
        </aside>
      )}
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingProject?.id ? `Editar Detalles: ${editingProject.name}` : 'Crear Nuevo Proyecto'}
      >
        <ProjectForm
          project={editingProject}
          clients={clients}
          onSave={handleSaveProject}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este proyecto? Esta acción también eliminará todas sus notas, links y prompts asociados, y no se puede deshacer."
        isLoading={isSubmitting}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
};

export default Projects;