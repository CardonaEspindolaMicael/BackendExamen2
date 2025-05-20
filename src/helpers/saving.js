// Almacenamiento en memoria para las páginas de cada sala
const roomPagesStorage = {};

// Función para obtener los datos más recientes de una página
export function getLatestPageData(room, pageId) {
  // Verificar si existe la sala
  if (!roomPagesStorage[room]) {
    roomPagesStorage[room] = {};
  }
  
  // Verificar si existe la página en esa sala
  if (!roomPagesStorage[room][pageId]) {
    return { 
      components: [], 
      css: '', 
      timestamp: Date.now() 
    };
  }
  
  // Devolver los datos de la página
  return roomPagesStorage[room][pageId];
}

// Función para guardar o actualizar los datos de una página
export function savePageData(room, pageId, data) {
  // Asegurar que existe la estructura para esta sala
  if (!roomPagesStorage[room]) {
    roomPagesStorage[room] = {};
  }
  
  // Guardar o actualizar los datos con timestamp actual
  roomPagesStorage[room][pageId] = {
    components: data.components || [],
    css: data.css || '',
    timestamp: Date.now(),
    // Opcionalmente guardar información adicional
    lastUpdatedBy: data.userInfo ? data.userInfo.userName : 'Unknown'
  };
}

