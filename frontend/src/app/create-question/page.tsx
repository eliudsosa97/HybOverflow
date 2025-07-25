"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { questionService } from "@/services/api";
import { BookOpen, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateQuestion() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    } else if (formData.title.length < 10) {
      newErrors.title = "El título debe tener al menos 10 caracteres";
    } else if (formData.title.length > 200) {
      newErrors.title = "El título no puede exceder 200 caracteres";
    }

    if (!formData.content.trim()) {
      newErrors.content = "El contenido es requerido";
    } else if (formData.content.length < 20) {
      newErrors.content = "El contenido debe tener al menos 20 caracteres";
    } else if (formData.content.length > 5000) {
      newErrors.content = "El contenido no puede exceder 5000 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await questionService.createQuestion(formData);
      toast.success("¡Pregunta creada exitosamente!");
      router.push(`/questions/${response.data.question.id}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Error al crear la pregunta";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
              <Link href="/profile" className="btn btn-secondary">
                Mi Perfil
              </Link>
              <span className="text-sm text-gray-600">
                Hola, {user?.first_name}
              </span>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link
            href="/questions"
            className="hover:text-blue-600 transition-colors"
          >
            Preguntas
          </Link>
          <span>/</span>
          <span className="text-gray-900">Nueva pregunta</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/questions"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Volver a preguntas
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hacer una pregunta
          </h1>
          <p className="text-lg text-gray-600">
            Comparte tu duda con la comunidad estudiantil
          </p>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Consejos para una buena pregunta
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Sé específico y descriptivo en el título</li>
            <li>• Explica el contexto y lo que has intentado</li>
            <li>• Incluye ejemplos o código si es relevante</li>
            <li>• Revisa que no haya preguntas similares</li>
          </ul>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Título de la pregunta *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className={`form-input ${errors.title ? "border-red-500" : ""}`}
                placeholder="¿Cómo puedo...? ¿Por qué ocurre...? ¿Cuál es la diferencia entre...?"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.title.length}/200 caracteres
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descripción detallada *
              </label>
              <textarea
                id="content"
                name="content"
                rows={12}
                className={`form-input form-textarea ${
                  errors.content ? "border-red-500" : ""
                }`}
                placeholder="Describe tu pregunta con detalle. Incluye:&#10;&#10;1. El contexto del problema&#10;2. Lo que has intentado&#10;3. El resultado esperado vs el actual&#10;4. Código relevante (si aplica)&#10;&#10;Ejemplo:&#10;Estoy trabajando en un proyecto de React y necesito..."
                value={formData.content}
                onChange={handleChange}
                maxLength={5000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.content.length}/5000 caracteres
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link href="/questions" className="btn btn-secondary">
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publicando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send size={16} />
                    Publicar pregunta
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {(formData.title || formData.content) && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vista previa
            </h3>
            <div className="card">
              {formData.title && (
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {formData.title}
                </h2>
              )}
              {formData.content && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {formData.content}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
                <span>Por: {user?.username}</span>
                <span>•</span>
                <span>Ahora</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
