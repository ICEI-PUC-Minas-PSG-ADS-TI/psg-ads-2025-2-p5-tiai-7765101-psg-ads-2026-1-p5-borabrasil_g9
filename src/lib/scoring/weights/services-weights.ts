import servicesMatrix from "@/data/services-matrix.json";

interface CategoriaServicoJSON {
  descricao: string;
  pesoBase: number;
  temas: string[];
}

const categorias = servicesMatrix.categorias as Record<
  string,
  CategoriaServicoJSON
>;
const mapeamento = servicesMatrix.mapeamentoTemas as Record<string, string>;

export function getCategoriaServico(
  temaCategoria: string,
): string | null {
  return mapeamento[temaCategoria] ?? null;
}

export function getPesoServico(categoriaServico: string): number {
  const cat = categorias[categoriaServico];
  return cat?.pesoBase ?? 0;
}

export function isServicoEssencial(temaCategoria: string): boolean {
  return temaCategoria in mapeamento;
}

export function getTodasCategoriasServico(): Record<
  string,
  CategoriaServicoJSON
> {
  return categorias;
}
