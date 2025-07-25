"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { questionService } from "@/services/api";
import {
  Search,
  Plus,
  MessageCircle,
  Eye,
  ThumbsUp,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

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

interface Pagination {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { isAuthenticated, user } = useAuth();

  const fetchQuestions = async (
    page = 1,
    searchTerm = "",
    sort = "created_at"
  ) => {
    try {
      setLoading(true);
      const response = await questionService.getQuestions({
        page,
        per_page: 10,
        search: searchTerm,
        sort_by: sort,
        order: "desc",
      });

      setQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error("Error al cargar las preguntas");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage, search, sortBy);
  }, [currentPage, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuestions(1, search, sortBy);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "hace 1 día";
    if (diffDays < 7) return `hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-blue-600"
            >
              <BookOpen size={24} />
              StudentOverflow
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/questions" className="text-blue-600 font-medium">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Preguntas de la Comunidad
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Explora las preguntas de otros estudiantes y comparte tu
            conocimiento
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar preguntas..."
                  className="form-input pl-10 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input w-auto"
              >
                <option value="created_at">Más recientes</option>
                <option value="votes">Más votadas</option>
                <option value="views">Más vistas</option>
              </select>

              {isAuthenticated && (
                <Link href="/create-question" className="btn btn-primary">
                  <Plus size={16} />
                  Nueva Pregunta
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay preguntas disponibles
            </h3>
            <p className="text-gray-600 mb-6">
              {search
                ? "No se encontraron preguntas con esos términos de búsqueda."
                : "Sé el primero en hacer una pregunta a la comunidad."}
            </p>
            {isAuthenticated && (
              <Link href="/create-question" className="btn btn-primary">
                <Plus size={16} />
                Hacer la primera pregunta
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Stats */}
                  <div className="flex flex-col items-center text-center min-w-[80px]">
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <ThumbsUp size={14} />
                      <span>{question.votes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <MessageCircle size={14} />
                      <span>{question.answer_count}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye size={14} />
                      <span>{question.views}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        href={`/questions/${question.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {question.title}
                      </Link>
                      {question.is_solved && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Resuelto
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {question.content.substring(0, 200)}
                      {question.content.length > 200 && "..."}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User size={14} />
                        <span>{question.author.username}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {question.author.reputation} pts
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{formatDate(question.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_prev}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded transition-colors ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
