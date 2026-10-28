# TaskFlow — Система управления проектами

Копия Jira, реализованная по принципу чистой комнаты. Полноценная система управления задачами с Kanban-доской.

## 🏗️ Архитектура

```
├── src/                    # Frontend (React + TypeScript + Tailwind)
│   ├── components/         # UI компоненты
│   ├── pages/              # Страницы приложения
│   ├── hooks/              # React хуки
│   ├── store/              # Состояние приложения
│   └── types/              # TypeScript типы
├── server/                 # Backend (Go + Gin)
│   ├── main.go             # Точка входа
│   ├── internal/
│   │   ├── config/         # Конфигурация
│   │   ├── database/       # Подключение к БД, миграции
│   │   ├── handlers/       # HTTP хендлеры
│   │   ├── middleware/     # JWT авторизация
│   │   ├── models/         # Модели данных
│   │   └── router/         # Маршрутизация
│   └── migrations/         # SQL миграции
├── docker-compose.yml      # Оркестрация
└── Dockerfile              # Фронтенд контейнер
```

## ✨ Функционал

### Kanban-доска
- Drag & Drop задач между колонками
- 5 статусов: Бэклог → К выполнению → В работе → На ревью → Готово
- Приоритеты (5 уровней)
- Типы задач: Story, Bug, Task, Epic
- Story Points
- Labels/теги

### Управление проектами
- Создание/редактирование/удаление проектов
- Уникальные ключи проектов
- Управление участниками
- Прогресс-бары

### Пользователи
- Регистрация и авторизация (JWT)
- Роли: Admin, Member, Viewer
- Профили пользователей

### Дополнительно
- Комментарии к задачам
- Дашборд с обзором
- Адаптивный дизайн
- Тёмная боковая панель

## 🚀 Быстрый старт

### С Docker (рекомендуется)

```bash
docker-compose up -d
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

### Без Docker

#### Backend
```bash
cd server
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/taskflow?sslmode=disable"
export JWT_SECRET="your-secret-key"
go run main.go
```

#### Frontend
```bash
npm install
npm run dev
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Авторизация |
| GET | `/api/auth/me` | Текущий пользователь |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Список проектов |
| GET | `/api/projects/:id` | Проект по ID |
| POST | `/api/projects` | Создать проект |
| PUT | `/api/projects/:id` | Обновить проект |
| DELETE | `/api/projects/:id` | Удалить проект |
| POST | `/api/projects/:id/members` | Добавить участника |
| DELETE | `/api/projects/:id/members/:userId` | Удалить участника |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | Задачи проекта |
| GET | `/api/tasks/:id` | Задача по ID |
| POST | `/api/tasks` | Создать задачу |
| PUT | `/api/tasks/:id` | Обновить задачу |
| PUT | `/api/tasks/:id/move` | Переместить задачу |
| DELETE | `/api/tasks/:id` | Удалить задачу |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/:taskId/comments` | Комментарии задачи |
| POST | `/api/tasks/:taskId/comments` | Добавить комментарий |
| DELETE | `/api/comments/:commentId` | Удалить комментарий |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Список пользователей |
| GET | `/api/users/:id` | Пользователь по ID |
| POST | `/api/users` | Создать пользователя (admin) |
| DELETE | `/api/users/:id` | Удалить пользователя (admin) |

## 🔧 Технологии

### Frontend
- **React 18** — UI фреймворк
- **TypeScript** — типизация
- **Tailwind CSS 4** — стилизация
- **@dnd-kit** — drag & drop
- **React Router** — маршрутизация
- **Framer Motion** — анимации
- **Lucide React** — иконки

### Backend
- **Go 1.21** — язык
- **Gin** — HTTP фреймворк
- **PostgreSQL 16** — база данных
- **JWT** — авторизация
- **bcrypt** — хеширование паролей

## 🔐 Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|-------------|
| `PORT` | Порт сервера | `8080` |
| `DATABASE_URL` | URL подключения к PostgreSQL | `postgres://postgres:postgres@localhost:5432/taskflow?sslmode=disable` |
| `JWT_SECRET` | Секретный ключ для JWT | `your-secret-key-change-in-production` |

## 📝 Демо-аккаунты

| Email | Роль |
|-------|------|
| admin@taskflow.ru | Администратор |
| dev@taskflow.ru | Участник |
| design@taskflow.ru | Участник |
| qa@taskflow.ru | Наблюдатель |

Пароль для всех: `demo123`
