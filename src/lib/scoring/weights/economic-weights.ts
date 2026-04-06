import economicRules from "@/data/economic-rules.json";

interface RegraEconomicaJSON {
  temaId: string;
  descricao: string;
  peso: number;
  categoria: string;
}

interface PesoCategoriaJSON {
  descricao: string;
  pesoBase: number;
}

const regras = economicRules.regras as RegraEconomicaJSON[];
const pesosPorCategoria = economicRules.pesosPorCategoria as Record<
  string,
  PesoCategoriaJSON
>;

export function getPesoEconomico(temaCategoria: string): number {
  const regra = regras.find((r) => r.temaId === temaCategoria);
  if (!regra) return 0;
  return regra.peso;
}

export function getPesoBaseCategoria(categoriaEconomica: string): number {
  const cat = pesosPorCategoria[categoriaEconomica];
  return cat?.pesoBase ?? 0;
}

export function getTodasRegrasEconomicas(): RegraEconomicaJSON[] {
  return regras;
}
