-- =========================================
-- ESQUEMA DE BASE DE DATOS - STUDENTOVERFLOW
-- =========================================

-- Crear base de datos
-- CREATE DATABASE studentoverflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE studentoverflow;

-- =========================================
-- TABLA: users (Usuarios)
-- =========================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(200),
    university VARCHAR(100),
    major VARCHAR(100),
    reputation INTEGER DEFAULT 0 CHECK (reputation >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE
);

-- =========================================
-- TABLA: categories (Categorías)
-- =========================================
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#007bff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- =========================================
-- TABLA: questions (Preguntas)
-- =========================================
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    category_id INTEGER,
    votes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0 CHECK (views >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_solved BOOLEAN DEFAULT FALSE,
    
    -- Claves foráneas
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- =========================================
-- TABLA: answers (Respuestas)
-- =========================================
CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    votes INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- ÍNDICES PARA RENDIMIENTO
-- =========================================

-- Índices simples
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_questions_author_id ON questions(author_id);
CREATE INDEX idx_questions_category_id ON questions(category_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_author_id ON answers(author_id);

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_questions_active_solved ON questions(is_active, is_solved);
CREATE INDEX idx_answers_accepted_votes ON answers(is_accepted, votes DESC);
CREATE INDEX idx_questions_votes_views ON questions(votes DESC, views DESC);

-- =========================================
-- TRIGGERS PARA UPDATED_AT
-- =========================================

-- Trigger para actualizar updated_at en questions
CREATE TRIGGER update_questions_updated_at 
    AFTER UPDATE ON questions
    FOR EACH ROW 
    BEGIN
        UPDATE questions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger para actualizar updated_at en answers
CREATE TRIGGER update_answers_updated_at 
    AFTER UPDATE ON answers
    FOR EACH ROW 
    BEGIN
        UPDATE answers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- =========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =========================================

-- Insertar categorías básicas
INSERT INTO categories (name, description, slug, color) VALUES
('Programación', 'Preguntas sobre desarrollo de software y programación', 'programacion', '#3b82f6'),
('Matemáticas', 'Preguntas sobre matemáticas, cálculo y álgebra', 'matematicas', '#ef4444'),
('Física', 'Preguntas sobre física y ciencias naturales', 'fisica', '#10b981'),
('Química', 'Preguntas sobre química y laboratorio', 'quimica', '#f59e0b'),
('Ingeniería', 'Preguntas sobre ingeniería y diseño', 'ingenieria', '#8b5cf6');

-- Usuario administrador de ejemplo
INSERT INTO users (username, email, password_hash, first_name, last_name, university, major, reputation) VALUES
('admin', 'admin@studentoverflow.com', 'hash_placeholder', 'Admin', 'Sistema', 'Universidad Nacional', 'Administración de Sistemas', 1000);

-- =========================================
-- VISTAS ÚTILES
-- =========================================

-- Vista de preguntas con información del autor y categoría
CREATE VIEW questions_detailed AS
SELECT 
    q.id,
    q.title,
    q.content,
    q.votes,
    q.views,
    q.created_at,
    q.is_solved,
    u.username as author_username,
    u.reputation as author_reputation,
    c.name as category_name,
    c.color as category_color,
    (SELECT COUNT(*) FROM answers WHERE question_id = q.id AND is_active = TRUE) as answer_count
FROM questions q
LEFT JOIN users u ON q.author_id = u.id
LEFT JOIN categories c ON q.category_id = c.id
WHERE q.is_active = TRUE;

-- Vista de estadísticas por usuario
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.reputation,
    COUNT(DISTINCT q.id) as questions_count,
    COUNT(DISTINCT a.id) as answers_count,
    SUM(DISTINCT q.votes) as total_question_votes,
    SUM(DISTINCT a.votes) as total_answer_votes
FROM users u
LEFT JOIN questions q ON u.id = q.author_id AND q.is_active = TRUE
LEFT JOIN answers a ON u.id = a.author_id AND a.is_active = TRUE
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.reputation;

