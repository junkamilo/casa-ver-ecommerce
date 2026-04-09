# 🎯 PROMPT MAESTRO PARA REFACTORIZACIÓN A ARQUITECTURA LIMPIA

## Instrucciones para usar conmigo (Claude)

Cuando compartas tu código y quieras que lo refactorice, usaremos este prompt como referencia. Copia esto cuando me pidas ayuda:

---

## 📋 SOLICITUD DE REFACTORIZACIÓN

```
Necesito refactorizar mi proyecto a ARQUITECTURA LIMPIA.

ESTRUCTURA ACTUAL:
[Compartir el árbol de carpetas actual]

CÓDIGO A REFACTORIZAR:
[Compartir los componentes, hooks, servicios actuales]

REQUISITOS:

1. ✅ INSPECCIONAR
   - Analizar componentes, hooks, servicios, tipos
   - Identificar qué va en cada carpeta
   - Detectar lógica acoplada

2. ✅ ARQUITECTURA LIMPIA
   - Components: SOLO JSX
   - Hooks: SOLO lógica React
   - Services: SOLO lógica de negocio
   - Types: SOLO interfaces TypeScript
   - DTOs: SOLO contractos de API
   - Utils: SOLO funciones puras
   - Constants: SOLO valores fijos
   - Mappers: SOLO transformaciones

3. ✅ SEPARACIÓN TOTAL
   - ❌ NO interfaces en componentes
   - ❌ NO useEffect en componentes
   - ❌ NO hooks custom en componentes
   - ❌ NO servicios en componentes
   - ❌ NO constantes en componentes
   - ❌ TODO debe importarse de sus carpetas

4. ✅ ESTRUCTURA DE CARPETAS
   - Crear carpetas: types, dtos, hooks, services, constants, utils, mappers
   - Si hay un archivo types.ts → crear carpeta types/ y mover adentro
   - Si hay constants.ts → crear carpeta constants/ y mover adentro
   - Aplicar a módulos también

5. ✅ NO ROMPER FUNCIONALIDADES
   - Refactor puro (no cambiar lógica)
   - Mantener mismo comportamiento
   - Verificar imports después de mover

6. ✅ OPTIMIZAR
   - Eliminar código duplicado
   - Reutilizar funciones
   - Mejorar performance

7. ✅ ESCALABILIDAD
   - Preparar para módulos nuevos
   - Facilitar testing
   - Preparar para crecimiento

8. ✅ ORGANIZAR MÓDULOS
   - Si hay módulos, aplicar arquitectura a CADA MÓDULO
   - Respetar limites de módulos
   - Exports públicos en index.ts

MODELO A SEGUIR:

src/
├── modules/
│   ├── [moduleName]/
│   │   ├── components/     (Solo JSX)
│   │   ├── hooks/          (Lógica React)
│   │   ├── services/       (Lógica negocio)
│   │   ├── store/          (Estado global)
│   │   ├── types/          (Interfaces)
│   │   ├── dtos/           (Contractos)
│   │   ├── constants/      (Valores)
│   │   ├── utils/          (Funciones)
│   │   ├── mappers/        (Transformaciones)
│   │   └── index.ts        (Exports)
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── dtos/
│   ├── constants/
│   ├── utils/
│   ├── config/
│   └── styles/

ENTREGAR:
1. ✅ Árbol de carpetas completo
2. ✅ Archivos reorganizados (código refactorizado)
3. ✅ index.ts de cada módulo con exports
4. ✅ Validación de imports
5. ✅ Checklist de qué cambió
```

---

## 🔄 Flujo de Refactorización

### PASO 1: Análisis
```
[Compartir código] 
→ Claude analiza estructura actual
→ Identifica qué va en cada carpeta
→ Planifica reorganización
```

### PASO 2: Crear estructura
```
Claude crea:
- Árbol de carpetas
- Nuevos archivos
- index.ts de módulos
```

### PASO 3: Refactorizar código
```
Claude reorganiza:
- Componentes (solo JSX)
- Hooks (lógica React)
- Services (lógica negocio)
- Types (interfaces)
- DTOs (contractos)
- Utils (funciones puras)
- Constants (valores)
- Mappers (transformaciones)
```

### PASO 4: Validar
```
Claude verifica:
- ✅ Funcionalidad intacta
- ✅ Imports correctos
- ✅ Sin código duplicado
- ✅ Arquitectura limpia
```

---

## 💾 Formato de Entrega

```typescript
// 1. ÁRBOL DE CARPETAS
src/modules/[module]/
├── components/
│   ├── [Component].tsx
│   └── index.ts
├── hooks/
│   ├── use[Hook].ts
│   └── index.ts
├── services/
│   ├── [service].ts
│   └── index.ts
├── types/
│   ├── [type].ts
│   └── index.ts
├── dtos/
│   ├── [dto].ts
│   └── index.ts
├── constants/
│   ├── [const].ts
│   └── index.ts
├── utils/
│   ├── [util].ts
│   └── index.ts
└── index.ts

// 2. CÓDIGO REFACTORIZADO
[Archivos con código completo]

// 3. INDEX.TS (Exports públicos)
export { useLogin, useRegister } from './hooks';
export { loginService, registerService } from './services';
export { LoginForm, RegisterForm } from './components';
export type { User, LoginRequest } from './types';

// 4. CHECKLIST
✅ Components: Solo JSX
✅ Hooks: Sin servicios directos
✅ Services: Sin React
✅ Types: Centralizados
✅ DTOs: Separados
✅ Utils: Puras
✅ Constants: Agrupadas
✅ Imports: Correctos
✅ Funcionalidad: Intacta
```

---

## 🚀 Cómo Usar Este Prompt

### Opción A: Simple
```
Refactoriza este código a arquitectura limpia:
[Compartir código]

Sigue la estructura:
src/modules/[module]/{components,hooks,services,types,dtos,constants,utils}
```

### Opción B: Detallada (RECOMENDADO)
```
[Copia el PROMPT MAESTRO de arriba]
[Agrega tu código]
```

### Opción C: Modular
```
Tengo TuneLore con módulos: artists, music, streaming, social

Refactoriza el módulo 'artists' a arquitectura limpia:
[Código del módulo artists]

Sigue la estructura de carpetas...
```

---

## ⚠️ Reglas Estrictas Durante Refactor

1. **NADA en componentes excepto JSX**
   ```typescript
   // ❌ NUNCA
   export const LoginForm = () => {
     const [email, setEmail] = useState('');
     const handleLogin = async () => { ... };
     useEffect(() => { ... }, []);
     interface LoginData { ... }
     const API_URL = '...';
     return <form>...</form>;
   };

   // ✅ SIEMPRE
   interface LoginFormProps {
     email: string;
     password: string;
     onSubmit: () => void;
   }
   export const LoginForm: React.FC<LoginFormProps> = ({ ... }) => (
     <form>...</form>
   );
   ```

2. **TODA lógica React en hooks**
   ```typescript
   // ✅ Hook con TODA la lógica
   export const useLogin = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [loading, setLoading] = useState(false);

     useEffect(() => {
       // Effects aquí
     }, []);

     const login = async () => {
       setLoading(true);
       // Llamar service
       setLoading(false);
     };

     return { email, password, loading, login, setEmail, setPassword };
   };
   ```

3. **Services sin React**
   ```typescript
   // ✅ Service puro (sin useState, useEffect, etc)
   export class AuthService {
     async login(email: string, password: string) {
       const response = await fetch('/api/login', {
         method: 'POST',
         body: JSON.stringify({ email, password }),
       });
       return response.json();
     }
   }
   export const authService = new AuthService();
   ```

4. **Types centralizados**
   ```typescript
   // types/auth.types.ts
   export interface User {
     id: string;
     email: string;
     name: string;
   }

   export interface AuthState {
     user: User | null;
     token: string | null;
   }
   ```

5. **DTOs separados**
   ```typescript
   // dtos/loginRequest.dto.ts
   export interface LoginRequest {
     email: string;
     password: string;
   }

   // dtos/loginResponse.dto.ts
   export interface LoginResponse {
     token: string;
     user: User;
   }
   ```

6. **Constants agrupados**
   ```typescript
   // constants/auth.constants.ts
   export const AUTH = {
     API_BASE: '/api/auth',
     ENDPOINTS: {
       LOGIN: '/api/auth/login',
       LOGOUT: '/api/auth/logout',
     },
     MESSAGES: {
       INVALID_CREDS: 'Credenciales inválidas',
     },
   };
   ```
## ✅ Checklist Final

Antes de dar por completo el refactor:

- [ ] Todos los tipos están en `types/`
- [ ] Todos los DTOs están en `dtos/`
- [ ] Todas las constantes están en `constants/`
- [ ] Todos los hooks están en `hooks/`
- [ ] Todos los servicios están en `services/`
- [ ] Todos los utils están en `utils/`
- [ ] Componentes solo tienen JSX
- [ ] index.ts exporta lo público
- [ ] No hay imports de implementación privada
- [ ] Las funcionalidades funcionan igual
- [ ] No hay código duplicado
- [ ] Todo está testeable
- [ ] Documentación completa

---

## 🎓 Después del Refactor

1. **Documenta** la estructura en `ARCHITECTURE.md`
2. **Entrena** al equipo en los nuevos patrones
3. **Automatiza** con linters y pre-commit hooks
4. **Monitorea** que nadie rompa la arquitectura

```bash
# eslint rule para evitar imports privados
"no-restricted-imports": [
  "error",
  {
    "patterns": ["@/modules/*/services/*", "@/modules/*/hooks/*"]
  }
]
```

---

## 📞 Soporte

Si durante el refactor hay dudas:

1. **Pregunta específica del código**: Comparte el archivo y pregunta
2. **Patrón no claro**: Muestra ejemplo y explica qué no entiende
3. **Módulo complejo**: Divide en partes más pequeñas

Recuerda: **Mejor refactor lento y correcto que rápido y roto.**

---

## 🎯 TU TURNO

Comparte tu código y usa este prompt. Estaré listo para:

1. ✅ Inspeccionar la estructura actual
2. ✅ Planificar la reorganización
3. ✅ Crear todas las carpetas
4. ✅ Refactorizar todo el código
5. ✅ Validar que funciona igual
6. ✅ Entregar optimizado y escalable

¡Vamos!
