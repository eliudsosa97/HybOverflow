"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { questionService } from "@/services/api";
import Link from "next/link";
import {
  BookOpen,
  Users,
  MessageCircle,
  Award,
  ArrowRight,
  Plus,
  Search,
  TrendingUp,
  Clock,
  User,
  Eye,
  ThumbsUp,
} from "lucide-react";

interface Question {
  id: number;
  title: string;
  content: string;
  votes: number;
  views: number;
  created_at: string;
  is_solved: boolean;
  answer_count: number;
  author: {
    id: number;
    username: string;
    reputation: number;
  };
}

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [popularQuestions, setPopularQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);

        // Obtener preguntas recientes
        const recentResponse = await questionService.getQuestions({
          page: 1,
          per_page: 5,
          sort_by: "created_at",
          order: "desc",
        });
        setRecentQuestions(recentResponse.data.questions);

        // Obtener preguntas populares
        const popularResponse = await questionService.getQuestions({
          page: 1,
          per_page: 5,
          sort_by: "votes",
          order: "desc",
        });
        setPopularQuestions(popularResponse.data.questions);
      } catch (error) {
        console.error("Error al cargar preguntas:", error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "hace 1 día";
    if (diffDays < 7) return `hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES");
  };

  const QuestionCard = ({ question }: { question: Question }) => (
    <Link
      href={`/questions/${question.id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 pr-2">
          {question.title}
        </h3>
        {question.is_solved && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
            Resuelto
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {question.content.substring(0, 120)}...
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <ThumbsUp size={12} />
            <span>{question.votes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={12} />
            <span>{question.answer_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{question.views}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>{question.author.username}</span>
          <span>•</span>
          <span>{formatDate(question.created_at)}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-blue-600"
            >
              <BookOpen size={24} />
              StudentOverflow
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/questions"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Preguntas
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link href="/create-question" className="btn btn-primary">
                    <Plus size={16} />
                    Hacer Pregunta
                  </Link>
                  <Link href="/profile" className="btn btn-secondary">
                    Mi Perfil
                  </Link>
                  <span className="text-sm text-gray-600">
                    Hola, {user?.first_name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="btn btn-outline">
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido dinámico basado en autenticación */}
      {isAuthenticated ? (
        /* Dashboard para usuarios autenticados */
        <div className="bg-gray-50">
          {/* Welcome Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  ¡Bienvenido de vuelta, {user?.first_name}! 👋
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  ¿Qué quieres aprender o compartir hoy?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/create-question"
                    className="btn btn-primary btn-lg inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Hacer una Pregunta
                  </Link>
                  <Link
                    href="/questions"
                    className="btn btn-outline btn-lg inline-flex items-center gap-2"
                  >
                    <Search size={20} />
                    Explorar Preguntas
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Award size={24} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {user?.reputation || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Puntos de reputación
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MessageCircle size={24} className="text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">Respuestas dadas</div>
                </div>

                <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={24} className="text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">Preguntas hechas</div>
                </div>

                <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp size={24} className="text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">4</div>
                  <div className="text-sm text-gray-600">
                    Respuestas aceptadas
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent and Popular Questions */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Questions */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Clock size={24} className="text-blue-600" />
                      Preguntas Recientes
                    </h2>
                    <Link
                      href="/questions"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver todas →
                    </Link>
                  </div>

                  {loadingQuestions ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentQuestions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular Questions */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp size={24} className="text-green-600" />
                      Preguntas Populares
                    </h2>
                    <Link
                      href="/questions?sort_by=votes"
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Ver todas →
                    </Link>
                  </div>

                  {loadingQuestions ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {popularQuestions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Landing page para usuarios no autenticados */
        <div>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                  Bienvenido a{" "}
                  <span className="text-blue-600">StudentOverflow</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  La plataforma donde estudiantes comparten conocimiento,
                  resuelven dudas y aprenden juntos. Haz preguntas, obtén
                  respuestas y ayuda a otros en su journey académico.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="btn btn-primary btn-lg inline-flex items-center gap-2"
                  >
                    Únete Ahora
                    <ArrowRight size={20} />
                  </Link>
                  <Link href="/questions" className="btn btn-outline btn-lg">
                    Explorar Preguntas
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ¿Por qué StudentOverflow?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Una plataforma diseñada específicamente para estudiantes, con
                  todas las herramientas que necesitas para aprender y enseñar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Preguntas Académicas
                  </h3>
                  <p className="text-gray-600">
                    Haz preguntas específicas sobre tus materias y recibe ayuda
                    de estudiantes con experiencia.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Comunidad Estudiantil
                  </h3>
                  <p className="text-gray-600">
                    Conecta con estudiantes de tu universidad y otras
                    instituciones educativas.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="text-purple-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Respuestas de Calidad
                  </h3>
                  <p className="text-gray-600">
                    Sistema de votación que asegura que las mejores respuestas
                    sean las más visibles.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="text-orange-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Sistema de Reputación
                  </h3>
                  <p className="text-gray-600">
                    Gana puntos ayudando a otros y conviértete en un miembro
                    reconocido de la comunidad.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Preview Questions */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Explora algunas preguntas
                </h2>
                <p className="text-lg text-gray-600">
                  Mira el tipo de discusiones que suceden en nuestra comunidad
                </p>
              </div>

              {loadingQuestions ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentQuestions.slice(0, 4).map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <Link href="/questions" className="btn btn-primary btn-lg">
                  Ver todas las preguntas
                </Link>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-blue-600 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4">
                  ¿Listo para comenzar tu journey de aprendizaje?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Únete a miles de estudiantes que ya están compartiendo
                  conocimiento
                </p>
                <Link
                  href="/register"
                  className="btn btn-secondary btn-lg inline-flex items-center gap-2"
                >
                  Crear Cuenta Gratis
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Preguntas Resueltas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Estudiantes Activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Universidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo y descripción */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={24} />
                  <span className="text-xl font-bold">StudentOverflow</span>
                </div>
                <p className="text-gray-300 mb-4">
                  La plataforma de preguntas y respuestas para estudiantes.
                  Comparte conocimiento, ayuda a otros y aprende juntos.
                </p>
              </div>

              {/* Enlaces rápidos */}
              <div>
                <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link
                      href="/questions"
                      className="hover:text-white transition-colors"
                    >
                      Explorar Preguntas
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="hover:text-white transition-colors"
                    >
                      Únete a la Comunidad
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Ayuda */}
              <div>
                <h3 className="font-semibold mb-4">Ayuda</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Cómo Funciona
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Términos de Uso
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 StudentOverflow. Todos los derechos reservados.
              </p>
              <p className="text-gray-400 text-sm">
                Hecho con ❤️ para estudiantes
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
