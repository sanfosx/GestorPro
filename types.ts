
export enum ProjectStatus {
  NotStarted = 'No Iniciado',
  InProgress = 'En Progreso',
  Completed = 'Completado',
  OnHold = 'En Pausa',
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName?: string; 
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface Link {
  id: string;
  projectId: string;
  url: string;
  description: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface Prompt {
  id: string;
  projectId: string;
  prompt: string;
  response: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  createdAt: string;
  id_builderBot: string;
  status: string;
  updatedAt: string;
  onlineSince?: string;
  lastOnlineDuration?: string;
  builderBotApiKey?: string;
}

// --- FLOW TYPES ---

export interface AnswerOptions {
  sensitive: boolean;
  capture: boolean;
  media: string | null;
  delay: number;
  gotoFlow: string | null;
}

export interface ContentSettings {
  split: boolean;
  interpretLinks: boolean;
}

export interface OpenAiSettings {
  assistantId: string;
  assistantName: string;
  assistantInstructions: string;
  assistantVectorStoreIds: string[];
  assistantFileSearch: boolean;
  assistantInterpretMultimedia: null;
  assistantSplitParagraphs: null;
  assistantModel: string;
  assistantProvider: string;
  assistantFiles: any[];
}

export interface Plugins {
  chatPdf: null;
  http: null;
  openai: OpenAiSettings;
  shopify: null;
  mute: null;
  schedule: null;
  intent: null;
  voice: null;
  reminder: null;
  notification: null;
  structuredOutput: null;
  scheduleGoogleCalendar: null;
}

export interface Answer {
  options: AnswerOptions;
  contentSettings: ContentSettings;
  rules: any[];
  plugins: Plugins;
  id: string;
  uuid: string;
  message: string;
  type: string;
  sort: number;
  ref: string;
  cb: string;
  deletedAt: string | null;
  flowId: string;
  botId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowOptions {
  listenKeywords: boolean;
  transcribeAudio: boolean;
  fastEntries: boolean;
  interpretImage: boolean;
  analyzeDocument: boolean;
}

export interface Flow {
  options: FlowOptions;
  id: string;
  uuid: string;
  name: string;
  label: string;
  sort: number;
  sensitive: boolean;
  deletedAt: string | null;
  keyword: string[];
  botId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  answers: Answer[];
}
