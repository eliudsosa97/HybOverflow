"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/api";
import {
  BookOpen,
  User,
  Edit,
  MessageCircle,
  HelpCircle,
  Award,
  Calendar,
  Mail,
  GraduationCap,
  MapPin,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserStats {
  questions_count: number;
  answers_count: number;
  accepted_answers: number;
  total_votes: number;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    questions_count: 0,
    answers_count: 0,
    accepted_answers: 0,
    total_votes: 0,
  });
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    university: "",
    major: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const { isAuthenticated, user, loading, logout, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        university: user.university || "",
        major: user.major || "",
      });

      // Simular estadísticas (en una app real, esto vendría de la API)
      setUserStats({
        questions_count: Math.floor(Math.random() * 10) + 1,
        answers_count: Math.floor(Math.random() * 15) + 2,
        accepted_answers: Math.floor(Math.random() * 5) + 1,
        total_votes: Math.floor(Math.random() * 50) + 10,
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await userService.updateProfile(formData);
      updateUser(response.data.user);
      toast.success("Perfil actualizado exitosamente");
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Error al actualizar el perfil";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
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

  if (!isAuthenticated || !user) {
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
              <Link href="/create-question" className="btn btn-primary">
                Hacer Pregunta
              </Link>
              <Link href="/profile" className="text-blue-600 font-medium">
                Mi Perfil
              </Link>
              <span className="text-sm text-gray-600">
                Hola, {user.first_name}
              </span>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="card">
              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={40} className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600">@{user.username}</p>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <Award size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.reputation} puntos de reputación
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                {user.bio ? (
                  <p className="text-gray-700 text-center italic">
                    "{user.bio}"
                  </p>
                ) : (
                  <p className="text-gray-500 text-center italic">
                    Sin biografía aún
                  </p>
                )}
              </div>

              {/* Info Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>

                {user.university && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <GraduationCap size={16} />
                    <span>{user.university}</span>
                  </div>
                )}

                {user.major && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <BookOpen size={16} />
                    <span>{user.major}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Miembro desde {formatDate(user.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline w-full"
                >
                  <Edit size={16} />
                  Editar perfil
                </button>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary w-full text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Activity */}
          <div className="lg:col-span-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <HelpCircle size={24} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {userStats.questions_count}
                </div>
                <div className="text-sm text-gray-600">Preguntas</div>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={24} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {userStats.answers_count}
                </div>
                <div className="text-sm text-gray-600">Respuestas</div>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award size={24} className="text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {userStats.accepted_answers}
                </div>
                <div className="text-sm text-gray-600">Aceptadas</div>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <User size={24} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {userStats.total_votes}
                </div>
                <div className="text-sm text-gray-600">Votos</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Acciones rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/create-question" className="btn btn-primary">
                  <HelpCircle size={16} />
                  Hacer una pregunta
                </Link>

                <Link href="/questions" className="btn btn-outline">
                  <MessageCircle size={16} />
                  Ver todas las preguntas
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Actividad reciente
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <HelpCircle size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Pregunta creada</p>
                    <p className="text-xs text-gray-600">
                      ¿Cómo optimizar consultas SQL?
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">hace 2 días</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Respuesta publicada</p>
                    <p className="text-xs text-gray-600">
                      Respondiste: "¿Qué es React Hooks?"
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">hace 5 días</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award size={16} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Respuesta aceptada</p>
                    <p className="text-xs text-gray-600">
                      Tu respuesta fue marcada como solución
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">hace 1 semana</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Editar perfil
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      className="form-input"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      className="form-input"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Biografía
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    className="form-input form-textarea"
                    placeholder="Cuéntanos algo sobre ti..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500 caracteres
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="university"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Universidad
                  </label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    className="form-input"
                    placeholder="Tu universidad"
                    value={formData.university}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="major"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Carrera
                  </label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    className="form-input"
                    placeholder="Tu carrera"
                    value={formData.major}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn btn-primary"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </div>
                    ) : (
                      "Guardar cambios"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
