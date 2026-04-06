import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  BarChart3,
  FileText,
  Target,
  Shield,
  Globe,
  Heart,
  Github,
  Mail,
} from "lucide-react";

export default function SobrePage() {
  return (
    <div className="container py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </Link>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Sobre o <span className="text-primary">Bora Brasil</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plataforma de transparência legislativa e análise de impacto social das votações no Congresso Nacional
          </p>
        </div>

        {/* Missão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Nossa Missão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Transformar dados legislativos complexos em informações acessíveis e relevantes para o cidadão comum, 
              permitindo que cada brasileiro compreenda como as decisões do Congresso afetam diretamente sua vida.
            </p>
            <p>
              Através de algoritmos inteligentes e análise socioeconômica, avaliamos o impacto real das votações 
              parlamentares para diferentes classes sociais, promovendo transparência e empoderamento cívico.
            </p>
          </CardContent>
        </Card>

        {/* ODS 16 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              ODS 16 - Paz, Justiça e Instituições Eficazes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Meta 16.6</h3>
              <p className="text-sm">
                Desenvolver instituições eficazes, responsáveis e transparentes em todos os níveis
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Transparência Ativa</h4>
                  <p className="text-sm text-muted-foreground">
                    Tornamos acessíveis dados legislativos antes restritos a especialistas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Educação Cívica</h4>
                  <p className="text-sm text-muted-foreground">
                    Capacitamos cidadãos a entenderem o processo legislativo
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Responsabilização</h4>
                  <p className="text-sm text-muted-foreground">
                    Criamos métricas objetivas para avaliação parlamentar
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Participação Social</h4>
                  <p className="text-sm text-muted-foreground">
                    Facilitamos o engajamento informado na vida política
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funcionalidades */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Dashboard Interativo</h3>
                <p className="text-sm text-muted-foreground">
                  Visualização completa de todos os parlamentares com scores de desempenho
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Simulador de Impacto</h3>
                <p className="text-sm text-muted-foreground">
                  Análise personalizada do impacto das votações por faixa de renda
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Perfil Detalhado</h3>
                <p className="text-sm text-muted-foreground">
                  Análise individual de desempenho parlamentar com 5 pilares de avaliação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fontes de Dados */}
        <Card>
          <CardHeader>
            <CardTitle>Fontes de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Dados Oficiais</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• API Dados Abertos do Senado Federal</li>
                  <li>• API da Câmara dos Deputados</li>
                  <li>• IBGE PNAD Contínua</li>
                  <li>• ABEP Critério Brasil 2024</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Metodologia</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Classificação automática de temas</li>
                  <li>• Análise de direção (progressivo/regressivo)</li>
                  <li>• Pesos diferenciados por classe social</li>
                  <li>• Score normalizado (0-100)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        
        {/* Footer */}
        <div className="text-center pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bora Brasil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
