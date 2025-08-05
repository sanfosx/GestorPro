
import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProjects, getClients, getBots } from '../services/api';
import type { Project, Client, Bot } from '../types';
import { ProjectStatus } from '../types';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between transition-transform transform hover:scale-105">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      <i className={`fas ${icon} text-white text-2xl`}></i>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeBotsCount, setActiveBotsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Carga inicial de todos los datos
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [projectsData, clientsData, botsData] = await Promise.all([
            getProjects(), 
            getClients(),
            getBots()
        ]);
        setProjects(projectsData);
        setClients(clientsData);
        const activeBots = botsData.filter(bot => 
            bot.status?.toUpperCase() === 'ONLINE' || bot.status?.toUpperCase() === 'ACTIVE'
        ).length;
        setActiveBotsCount(activeBots);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Sondeo periódico solo para los bots
  useEffect(() => {
      const fetchBots = async () => {
          try {
              const botsData = await getBots();
              const activeBots = botsData.filter(bot => 
                  bot.status?.toUpperCase() === 'ONLINE' || bot.status?.toUpperCase() === 'ACTIVE'
              ).length;
              setActiveBotsCount(activeBots);
          } catch (error) {
              console.error("Error al sondear datos de bots:", error);
          }
      };

      const intervalId = setInterval(fetchBots, 30000); // Sondeo cada 30 segundos

      return () => clearInterval(intervalId); // Limpiar al desmontar
  }, []);

  const totalBudget = useMemo(() => {
    return projects.reduce((sum, project) => sum + project.budget, 0);
  }, [projects]);

  const projectStatusData = useMemo(() => {
    const statusCounts = {
      [ProjectStatus.NotStarted]: 0,
      [ProjectStatus.InProgress]: 0,
      [ProjectStatus.Completed]: 0,
      [ProjectStatus.OnHold]: 0,
    };
    projects.forEach(p => {
      statusCounts[p.status]++;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, proyectos: value }));
  }, [projects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-lg text-gray-500">Resumen de tus proyectos y clientes.</p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <SummaryCard title="Total de Proyectos" value={projects.length} icon="fa-briefcase" color="bg-blue-500" />
        <SummaryCard title="Total de Clientes" value={clients.length} icon="fa-users" color="bg-green-500" />
        <SummaryCard title="Bots Activos" value={activeBotsCount} icon="fa-robot" color="bg-purple-500" />
        <SummaryCard title="Presupuesto Total" value={`$${(totalBudget / 1000).toFixed(0)}k`} icon="fa-wallet" color="bg-yellow-500" />
        <SummaryCard title="Proyectos Activos" value={projects.filter(p => p.status === ProjectStatus.InProgress).length} icon="fa-cogs" color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Estado de Proyectos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectStatusData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip wrapperClassName="rounded-md shadow-lg" cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}/>
                <Legend />
                <Bar dataKey="proyectos" fill="#4f46e5" barSize={40} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Próximas Entregas</h3>
            <div className="space-y-4">
            {projects
                .filter(p => p.status !== ProjectStatus.Completed && new Date(p.endDate) > new Date())
                .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                .slice(0, 4)
                .map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-semibold text-gray-800">{project.name}</p>
                            <p className="text-sm text-gray-500">{project.clientName}</p>
                        </div>
                        <span className="font-medium text-indigo-600">{new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                ))
            }
            {projects.filter(p => p.status !== ProjectStatus.Completed).length === 0 && <p className="text-gray-500">No hay entregas pendientes.</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
