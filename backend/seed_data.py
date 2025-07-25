#!/usr/bin/env python3
"""
Script para agregar datos de ejemplo al sistema StudentOverflow
"""
from app import create_app
from models import db, User, Question, Answer, Category
from datetime import datetime, timedelta
import random

def create_sample_data():
    """Crear datos de ejemplo para demostrar la funcionalidad"""
    
    app = create_app()
    with app.app_context():
        
        # Limpiar datos existentes (solo para desarrollo)
        print("🧹 Limpiando datos existentes...")
        db.drop_all()
        db.create_all()
        
        # Crear categorías
        print("📚 Creando categorías...")
        categories = [
            Category(name="Programación", description="Preguntas sobre desarrollo de software", slug="programacion", color="#3b82f6"),
            Category(name="Matemáticas", description="Preguntas sobre matemáticas y cálculo", slug="matematicas", color="#ef4444"),
            Category(name="Física", description="Preguntas sobre física y ciencias naturales", slug="fisica", color="#10b981"),
            Category(name="Química", description="Preguntas sobre química y laboratorio", slug="quimica", color="#f59e0b"),
            Category(name="Ingeniería", description="Preguntas sobre ingeniería y diseño", slug="ingenieria", color="#8b5cf6"),
        ]
        
        for category in categories:
            db.session.add(category)
        
        db.session.commit()
        
        # Crear usuarios de ejemplo
        print("👥 Creando usuarios de ejemplo...")
        users_data = [
            {
                "username": "admin",
                "email": "admin@studentoverflow.com",
                "password": "admin123",
                "first_name": "Admin",
                "last_name": "Sistema",
                "university": "Universidad Nacional",
                "major": "Administración de Sistemas",
                "bio": "Administrador del sistema StudentOverflow",
                "reputation": 1000
            },
            {
                "username": "maria_garcia",
                "email": "maria@email.com",
                "password": "password123",
                "first_name": "María",
                "last_name": "García",
                "university": "Universidad Tecnológica",
                "major": "Ingeniería en Sistemas",
                "bio": "Estudiante de ingeniería, me gusta ayudar con programación",
                "reputation": 450
            },
            {
                "username": "carlos_lopez",
                "email": "carlos@email.com",
                "password": "password123",
                "first_name": "Carlos",
                "last_name": "López",
                "university": "Instituto Politécnico",
                "major": "Ingeniería Industrial",
                "bio": "Apasionado por las matemáticas y la optimización",
                "reputation": 380
            },
            {
                "username": "ana_rodriguez",
                "email": "ana@email.com",
                "password": "password123",
                "first_name": "Ana",
                "last_name": "Rodríguez",
                "university": "Universidad de Ciencias",
                "major": "Física",
                "bio": "Estudiante de física, especializada en mecánica cuántica",
                "reputation": 220
            },
            {
                "username": "juan_martinez",
                "email": "juan@email.com",
                "password": "password123",
                "first_name": "Juan",
                "last_name": "Martínez",
                "university": "Universidad Nacional",
                "major": "Química",
                "bio": "Investigador en química orgánica",
                "reputation": 180
            }
        ]
        
        users = []
        for user_data in users_data:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                university=user_data["university"],
                major=user_data["major"],
                bio=user_data["bio"],
                reputation=user_data["reputation"]
            )
            user.set_password(user_data["password"])
            db.session.add(user)
            users.append(user)
        
        db.session.commit()
        
        # Crear preguntas de ejemplo
        print("❓ Creando preguntas de ejemplo...")
        questions_data = [
            {
                "title": "¿Cómo optimizar consultas SQL en bases de datos grandes?",
                "content": """Estoy trabajando con una base de datos que tiene millones de registros y mis consultas SQL están tomando demasiado tiempo. He intentado usar índices básicos pero aún es lento.

¿Qué técnicas específicas puedo usar para optimizar las consultas? Especialmente estoy luchando con:

1. JOINs complejos entre múltiples tablas
2. Consultas con LIKE para búsquedas de texto
3. Agregaciones (COUNT, SUM) en grandes conjuntos de datos

¿Alguien tiene experiencia con esto? ¿Qué herramientas recomiendan para analizar el rendimiento?""",
                "author_index": 1,
                "category_index": 0,
                "votes": 15,
                "views": 234,
                "created_at": datetime.now() - timedelta(days=2),
                "is_solved": True
            },
            {
                "title": "Diferencia entre componentes funcionales y de clase en React",
                "content": """Soy nuevo en React y veo que hay dos formas de crear componentes: funcionales y de clase. He leído que los componentes funcionales son más modernos, pero no entiendo completamente las diferencias.

¿Cuándo debería usar cada uno? ¿Los hooks reemplazan completamente a los componentes de clase?

Ejemplo de lo que tengo:
```javascript
class MiComponente extends Component {
  constructor(props) {
    super(props);
    this.state = { contador: 0 };
  }
  
  render() {
    return <div>{this.state.contador}</div>;
  }
}
```

¿Cómo sería esto con un componente funcional?""",
                "author_index": 2,
                "category_index": 0,
                "votes": 8,
                "views": 156,
                "created_at": datetime.now() - timedelta(days=1),
                "is_solved": False
            },
            {
                "title": "¿Cómo resolver integrales por partes paso a paso?",
                "content": """Tengo problemas para entender el método de integración por partes. Mi profesor explicó la fórmula ∫u dv = uv - ∫v du, pero no sé cómo elegir u y dv correctamente.

Por ejemplo, con esta integral: ∫ x ln(x) dx

¿Qué debería ser u y qué debería ser dv? ¿Hay alguna regla o truco para decidir?

He intentado varias combinaciones pero siempre me quedo atascado. ¿Alguien puede explicarlo con este ejemplo específico?""",
                "author_index": 3,
                "category_index": 1,
                "votes": 12,
                "views": 189,
                "created_at": datetime.now() - timedelta(days=3),
                "is_solved": True
            },
            {
                "title": "Leyes de Newton: ¿cuándo aplicar cada una?",
                "content": """Estoy estudiando las leyes de Newton para mi examen de física y me confundo sobre cuándo aplicar cada ley.

Entiendo que:
- Primera ley: objetos en reposo o movimiento uniforme
- Segunda ley: F = ma
- Tercera ley: acción y reacción

Pero en los problemas prácticos no sé cuál usar. Por ejemplo, si tengo un bloque en un plano inclinado con fricción, ¿qué ley debo aplicar primero?

¿Hay algún método sistemático para abordar estos problemas?""",
                "author_index": 0,
                "category_index": 2,
                "votes": 6,
                "views": 98,
                "created_at": datetime.now() - timedelta(hours=12),
                "is_solved": False
            },
            {
                "title": "Git: ¿cómo revertir commits sin perder el historial?",
                "content": """Cometí un error y hice varios commits que necesito deshacer, pero sin perder el historial del repositorio. Trabajo en equipo y no quiero afectar a mis compañeros.

He leído sobre git revert y git reset, pero no estoy seguro cuál usar. Específicamente necesito:

1. Deshacer los últimos 3 commits
2. Mantener el historial visible
3. No afectar el repositorio remoto

¿Cuál es la mejor práctica en este caso? ¿Hay alguna forma de "previsualizar" qué va a pasar antes de ejecutar el comando?""",
                "author_index": 1,
                "category_index": 0,
                "votes": 20,
                "views": 312,
                "created_at": datetime.now() - timedelta(days=5),
                "is_solved": True
            }
        ]
        
        questions = []
        for q_data in questions_data:
            question = Question(
                title=q_data["title"],
                content=q_data["content"],
                author_id=users[q_data["author_index"]].id,
                category_id=categories[q_data["category_index"]].id,
                votes=q_data["votes"],
                views=q_data["views"],
                created_at=q_data["created_at"],
                is_solved=q_data["is_solved"]
            )
            db.session.add(question)
            questions.append(question)
        
        db.session.commit()
        
        # Crear respuestas de ejemplo
        print("💬 Creando respuestas de ejemplo...")
        answers_data = [
            {
                "content": """Excelente pregunta! Aquí tienes varias técnicas que me han funcionado:

**1. Índices Compuestos:**
```sql
CREATE INDEX idx_tabla_col1_col2 ON tabla(columna1, columna2);
```

**2. Para búsquedas LIKE, usa Full-Text Search:**
```sql
ALTER TABLE tabla ADD FULLTEXT(columna_texto);
SELECT * FROM tabla WHERE MATCH(columna_texto) AGAINST('búsqueda');
```

**3. Para agregaciones, considera vistas materializadas:**
```sql
CREATE MATERIALIZED VIEW resumen AS 
SELECT categoria, COUNT(*), SUM(valor) 
FROM tabla_grande 
GROUP BY categoria;
```

La clave está en entender el plan de ejecución de cada consulta. ¿Has probado con EXPLAIN?""",
                "question_index": 0,
                "author_index": 0,
                "votes": 12,
                "is_accepted": True,
                "created_at": datetime.now() - timedelta(days=1, hours=18)
            },
            {
                "content": """¡Perfecto timing para aprender React moderno! Te explico:

**Componente funcional equivalente:**
```javascript
import { useState } from 'react';

function MiComponente() {
  const [contador, setContador] = useState(0);
  
  return <div>{contador}</div>;
}
```

**Principales diferencias:**

1. **Sintaxis más simple:** Los funcionales son más concisos
2. **Hooks:** Permiten usar estado y efectos sin clases
3. **Rendimiento:** Ligeramente mejores en optimización

Los hooks como `useState`, `useEffect`, `useContext` cubren todos los casos de uso de las clases. ¡Te recomiendo enfocarte en componentes funcionales!""",
                "question_index": 1,
                "author_index": 1,
                "votes": 5,
                "is_accepted": False,
                "created_at": datetime.now() - timedelta(hours=18)
            }
        ]
        
        for a_data in answers_data:
            answer = Answer(
                content=a_data["content"],
                question_id=questions[a_data["question_index"]].id,
                author_id=users[a_data["author_index"]].id,
                votes=a_data["votes"],
                is_accepted=a_data["is_accepted"],
                created_at=a_data["created_at"]
            )
            db.session.add(answer)
        
        db.session.commit()
        
        print("✅ Datos de ejemplo creados exitosamente!")
        print(f"📊 Resumen:")
        print(f"   - {len(categories)} categorías")
        print(f"   - {len(users)} usuarios")
        print(f"   - {len(questions)} preguntas") 
        print(f"   - {len(answers_data)} respuestas")
        print("\n🔑 Usuarios de prueba:")
        for user_data in users_data:
            print(f"   - {user_data['username']} | {user_data['email']} | password: {user_data['password']}")

if __name__ == "__main__":
    create_sample_data() 