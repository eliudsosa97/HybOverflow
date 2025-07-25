"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { questionService, answerService } from "@/services/api";
import {
  BookOpen,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  Clock,
  User,
  Send,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface Author {
  id: number;
  username: string;
  reputation: number;
}

interface Answer {
  id: number;
  content: string;
  votes: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  author: Author;
}

interface Question {
  id: number;
  title: string;
  content: string;
  votes: number;
  views: number;
  created_at: string;
  updated_at: string;
  is_solved: boolean;
  answer_count: number;
  author: Author;
  answers: Answer[];
}

export default function QuestionDetail() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestion(parseInt(questionId));
      setQuestion(response.data);
    } catch (error: any) {
      toast.error("Error al cargar la pregunta");
      router.push("/questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para responder");
      return;
    }

    if (!answerContent.trim()) {
      toast.error("La respuesta no puede estar vacía");
      return;
    }

    if (answerContent.length < 20) {
      toast.error("La respuesta debe tener al menos 20 caracteres");
      return;
    }

    setIsSubmittingAnswer(true);

    try {
      await answerService.createAnswer({
        content: answerContent,
        question_id: parseInt(questionId),
      });

      toast.success("¡Respuesta publicada exitosamente!");
      setAnswerContent("");
      setShowAnswerForm(false);
      fetchQuestion(); // Recargar para mostrar la nueva respuesta
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Error al publicar la respuesta";
      toast.error(errorMessage);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId: number) => {
    if (!isAuthenticated || !question || question.author.id !== user?.id) {
      toast.error("Solo el autor de la pregunta puede aceptar respuestas");
      return;
    }

    try {
      await answerService.acceptAnswer(answerId);
      toast.success("Respuesta marcada como aceptada");
      fetchQuestion(); // Recargar para mostrar el cambio
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Error al aceptar la respuesta";
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "hace 1 día";
    if (diffDays < 7) return `hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pregunta no encontrada
          </h2>
          <Link href="/questions" className="btn btn-primary">
            Volver a preguntas
          </Link>
        </div>
      </div>
    );
  }

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
              <Link
                href="/questions"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Preguntas
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link href="/create-question" className="btn btn-primary">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link
            href="/questions"
            className="hover:text-blue-600 transition-colors"
          >
            Preguntas
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{question.title}</span>
        </div>

        {/* Back Button */}
        <Link
          href="/questions"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Volver a preguntas
        </Link>

        {/* Question */}
        <div className="card mb-8">
          <div className="flex gap-6">
            {/* Vote Section */}
            <div className="flex flex-col items-center min-w-[60px]">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ThumbsUp size={24} className="text-gray-600" />
              </button>
              <span className="text-2xl font-bold text-gray-900 my-2">
                {question.votes}
              </span>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ThumbsDown size={24} className="text-gray-600" />
              </button>

              {question.is_solved && (
                <div className="mt-4 p-2 bg-green-100 rounded-full">
                  <Check size={24} className="text-green-600" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 pr-4">
                  {question.title}
                </h1>
                {question.is_solved && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
                    ✓ Resuelto
                  </span>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {question.content}
                </p>
              </div>

              {/* Question Meta */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{question.views} vistas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    <span>{question.answer_count} respuestas</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{question.author.username}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {question.author.reputation} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatDate(question.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {question.answers.length === 0
              ? "Aún no hay respuestas"
              : question.answers.length === 1
              ? "1 Respuesta"
              : `${question.answers.length} Respuestas`}
          </h2>

          {question.answers.length === 0 ? (
            <div className="card text-center py-12">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sé el primero en responder
              </h3>
              <p className="text-gray-600 mb-6">
                Ayuda a {question.author.username} respondiendo a su pregunta
              </p>
              {isAuthenticated ? (
                <button
                  onClick={() => setShowAnswerForm(true)}
                  className="btn btn-primary"
                >
                  Escribir respuesta
                </button>
              ) : (
                <Link href="/login" className="btn btn-primary">
                  Iniciar sesión para responder
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {question.answers.map((answer) => (
                <div key={answer.id} className="card">
                  <div className="flex gap-6">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <ThumbsUp size={20} className="text-gray-600" />
                      </button>
                      <span className="text-xl font-bold text-gray-900 my-2">
                        {answer.votes}
                      </span>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <ThumbsDown size={20} className="text-gray-600" />
                      </button>

                      {/* Accept Button - Only for question author */}
                      {isAuthenticated &&
                        question.author.id === user?.id &&
                        !question.is_solved && (
                          <button
                            onClick={() => handleAcceptAnswer(answer.id)}
                            className="mt-3 p-2 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                            title="Marcar como respuesta aceptada"
                          >
                            <Check size={20} className="text-green-600" />
                          </button>
                        )}

                      {answer.is_accepted && (
                        <div className="mt-3 p-2 bg-green-100 rounded-lg">
                          <Check size={20} className="text-green-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {answer.is_accepted && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800 font-medium">
                            <Check size={16} />
                            Respuesta aceptada por el autor de la pregunta
                          </div>
                        </div>
                      )}

                      <div className="prose max-w-none mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {answer.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User size={14} />
                          <span>{answer.author.username}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {answer.author.reputation} pts
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{formatDate(answer.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Answer Form */}
        {isAuthenticated && (
          <div className="card">
            {!showAnswerForm ? (
              <button
                onClick={() => setShowAnswerForm(true)}
                className="w-full py-4 text-left text-gray-600 hover:text-gray-900 transition-colors"
              >
                Escribir una respuesta...
              </button>
            ) : (
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <label
                    htmlFor="answer"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tu respuesta
                  </label>
                  <textarea
                    id="answer"
                    rows={8}
                    className="form-input form-textarea"
                    placeholder="Escribe tu respuesta aquí...&#10;&#10;Consejos:&#10;• Sé claro y específico&#10;• Proporciona ejemplos si es útil&#10;• Explica el 'por qué', no solo el 'qué'"
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    maxLength={5000}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Mínimo 20 caracteres
                    </p>
                    <p className="text-xs text-gray-500">
                      {answerContent.length}/5000 caracteres
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingAnswer || answerContent.length < 20}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {isSubmittingAnswer ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Publicando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send size={16} />
                        Publicar respuesta
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAnswerForm(false);
                      setAnswerContent("");
                    }}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <div className="card text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Quieres responder a esta pregunta?
            </h3>
            <p className="text-gray-600 mb-4">
              Inicia sesión para compartir tu conocimiento con la comunidad
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/login" className="btn btn-primary">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn btn-outline">
                Crear Cuenta
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
