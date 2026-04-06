import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, FileText, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-16 md:pt-24 lg:pt-32">
        <div className="flex max-w-3xl flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Acompanhe o <span className="text-primary">Brasil</span> de perto
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Dados legislativos, indicadores públicos e transparência ao alcance
            de todos. Uma plataforma moderna para acompanhar o que importa.
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sobre">
              <Button variant="outline" size="lg">
                Saiba mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Dados em tempo real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Acompanhe indicadores e estatísticas atualizadas diretamente de
                fontes públicas oficiais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Proposições legislativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitore projetos de lei, votações e tramitações no Congresso
                Nacional.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Perfil de parlamentares</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Conheça os representantes, seus votos, gastos e atuação
                parlamentar.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bora Brasil. Todos os direitos
            reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito com transparência e código aberto.
          </p>
        </div>
      </footer>
    </div>
  );
}
