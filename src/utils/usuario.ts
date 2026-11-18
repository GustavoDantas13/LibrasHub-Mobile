export function ehUsuarioComunitario(tipo?: string | null) {
  return (tipo ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('comunit');
}
