export interface MetricsData {
  Crecimiento: {
    'Me gusta por Día': Array<{ date: string; value: number }>;
    'Seguidores por Día': Array<{ date: string; value: number }>;
    'Impresiones por Día': Array<{ date: string; value: number }>;
    'Visitas a la Página por Día': Array<{ date: string; value: number }>;
    'Alcance por Día': Array<{ date: string; value: number }>;
    'Reproducciones por Día': Array<{ date: string; value: number }>;
    'Reproducciones 30s por Día': Array<{ date: string; value: number }>;
  };
  Actividad: {
    'Publicaciones con Engagement': Array<{
      id: string;
      created_time: string;
      shares: number;
      comments: number;
    }>;
  };
  Totales: {
    'Total de Me gusta': number;
    'Total de Nuevos Me gusta': number;
    'Total de Seguidores': number;
    'Total de Nuevos Seguidores': number;
    'Total de Impresiones': number;
    'Total de Visitas a la Página': number;
    'Total de Alcance': number;
    "Total de Publicaciones": number;
    "Total de Comentarios": number,
    "Total de Compartidos": number,
    "Total de Reproducciones": number,
    "Total de Reproducciones 30s": number,
  };
  message?: string;
  error?: string;
}

export interface DemographicsCountryData {
  demographics: Array<{
    date: string;
    value: { [countryCode: string]: number };
  }>;
  error?: string; 
}

export interface MetricsData_ig {
  Crecimiento: {
    'Impresiones por Día': Array<{ date: string; value: number }>;
    'Alcance por Día': Array<{ date: string; value: number }>;
    'Publicaciones por Día': Array<{
      date: string;
      posts: number;
      comments: number;
      shares: number;
    }>;
  };
  Totales: {
    'Total de Impresiones': number;
    'Total de Alcance': number;
    'Total de Publicaciones': number;
    'Total de Comentarios': number;
    'Total de Compartidos': number;
    'Total de Seguidores': number;
  };
  message?: string;
  error?: string;
}

export interface InstagramTopReachResponse {
  top_posts: {
    id: string;          
    timestamp: string;   
    caption: string;     
    reach: number;       
  }[];
  message: string;        
}

export interface MetricsDataFollowerByDay {
  Crecimiento: {
    'Seguidores por Día': Array<{ date: string; value: number }>;
  };
  Totales: {
    'Total de Seguidores Ganado': number;
  };
  message?: string;
  error?: string;
}

export interface DemographicsData {
  breakdown_type: string;
  demographics: Record<string, number>;
  error?: string;
}

export interface FacebookPage {
  picture: string;
  id: string;
  name: string;
  business_account_id: string | null;
}