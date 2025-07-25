"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/services/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  reputation: number;
  bio?: string;
  avatar_url?: string;
  university?: string;
  major?: string;
  created_at: string;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  university?: string;
  major?: string;
}

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_USER"; payload: Partial<User> };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("token");

      if (token) {
        try {
          const response = await authService.verifyToken();
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: response.data.user,
              token: token,
            },
          });
        } catch (error) {
          Cookies.remove("token");
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    verifyToken();
  }, []);

  // Función de login
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.login(credentials);

      const { token, user } = response.data;
      Cookies.set("token", token, { expires: 7 }); // 7 días

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      toast.success("¡Inicio de sesión exitoso!");
      return { success: true };
    } catch (error: any) {
      dispatch({ type: "SET_LOADING", payload: false });
      const message = error.response?.data?.error || "Error al iniciar sesión";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Función de registro
  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.register(userData);

      const { token, user } = response.data;
      Cookies.set("token", token, { expires: 7 });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      toast.success("¡Registro exitoso! Bienvenido a StudentOverflow");
      return { success: true };
    } catch (error: any) {
      dispatch({ type: "SET_LOADING", payload: false });
      const message = error.response?.data?.error || "Error al registrarse";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Función de logout
  const logout = () => {
    Cookies.remove("token");
    dispatch({ type: "LOGOUT" });
    toast.success("Sesión cerrada exitosamente");
  };

  // Función para actualizar usuario
  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
