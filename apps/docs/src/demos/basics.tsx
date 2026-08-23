"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarStack,
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  EditableText,
  Field,
  Input,
  LevelMeter,
  LiveIndicator,
  Markdown,
  Menu,
  MenuItem,
  MentionTextarea,
  PageHint,
  Select,
  Textarea,
  ThemeToggle,
} from "@toimetdev/pathlogs-core";

/**
 * Живые примеры для страниц документации.
 *
 * Настоящие компоненты из пакета, а не скриншоты: если компонент сломается,
 * сломается и сайт — это самая честная проверка, какая тут возможна.
 */

const PEOPLE = [
  { id: "1", name: "Мурат Тоймет" },
  { id: "2", name: "Айгерим Сатпаева" },
  { id: "3", name: "Данияр Ким" },
  { id: "4", name: "Ольга Крылова" },
  { id: "5", name: "Тимур Абаев" },
];

export function ButtonDemo() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <Button variant="primary">Основная</Button>
      <Button variant="secondary">Вторичная</Button>
      <Button variant="ghost">Призрачная</Button>
      <Button variant="danger">Удалить</Button>
      <Button variant="gradient">Градиент</Button>
      <Button
        variant="primary"
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1800);
        }}
      >
        {loading ? "Сохраняем" : "Нажми меня"}
      </Button>
      <Button disabled>Выключена</Button>
    </div>
  );
}

export function ButtonSizesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <Button size="sm">Маленькая</Button>
      <Button size="md">Средняя</Button>
      <Button size="lg">Большая</Button>
    </div>
  );
}

export function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Новый проект"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Создать
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Название" required>
            {(props) => <Input {...props} placeholder="Редизайн личного кабинета" />}
          </Field>
          <Field label="Ключ" hint="Короткий префикс для номеров задач: PAY-12">
            {(props) => <Input {...props} placeholder="PAY" />}
          </Field>
        </div>
      </Dialog>
    </>
  );
}

export function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function confirm() {
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setOpen(false);
      setDone(true);
    }, 1200);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="danger" onClick={() => setOpen(true)}>
        Удалить колонку
      </Button>
      {done && <p className="text-xs text-muted">Готово — колонка удалена</p>}
      <ConfirmDialog
        open={open}
        pending={pending}
        title="Удалить колонку?"
        message="Карточки переедут в первую оставшуюся колонку. Отменить это будет нельзя."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        pendingLabel="Удаляем…"
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

export function MenuDemo() {
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <Menu label="Ещё" count={3} tip="Остальные действия">
        <MenuItem onClick={() => setLast("Экспорт")}>Экспортировать в Excel</MenuItem>
        <MenuItem onClick={() => setLast("Шаблоны")}>Шаблоны задач</MenuItem>
        <MenuItem tone="danger" onClick={() => setLast("Архив")}>
          Архивировать проект
        </MenuItem>
      </Menu>
      <p className="h-4 text-xs text-muted">{last && `Выбрано: ${last}`}</p>
    </div>
  );
}

export function TooltipDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button data-tip="Подсказка появляется над кнопкой">Наведи на меня</Button>
      <button
        type="button"
        data-tip="У иконки нет видимого текста, поэтому слой сам проставил ей aria-label"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge text-muted transition hover:text-foreground"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      </button>
    </div>
  );
}

const MARKDOWN_SAMPLE = `## Что сделано

Переписали разбор **входящих заявок**: теперь они попадают сразу в колонку
проекта, а не в общий список.

- проверка домена отправителя
- склейка дублей по теме письма
- \`X-Request-Id\` в каждом ответе

> Осталось решить, что делать с письмами без темы.

Подробности — в [описании задачи](https://example.com).`;

export function MarkdownDemo() {
  return (
    <div className="w-full max-w-lg rounded-xl border border-edge bg-surface p-5">
      <Markdown text={MARKDOWN_SAMPLE} mentions={PEOPLE.map((p) => p.name)} />
    </div>
  );
}

export function MarkdownSafetyDemo() {
  return (
    <div className="w-full max-w-lg rounded-xl border border-edge bg-surface p-5">
      <Markdown
        text={`<script>alert(1)</script> — остаётся текстом.

[Опасная ссылка](javascript:alert(1)) — ссылкой не становится.

[Обычная ссылка](https://example.com) — становится.`}
      />
    </div>
  );
}

export function EditableTextDemo() {
  const [title, setTitle] = useState("Починить импорт из Trello");
  const [note, setNote] = useState("Падает на досках, где **больше 500 карточек**.");

  return (
    <div className="flex w-full max-w-lg flex-col gap-4 rounded-xl border border-edge bg-surface p-5">
      <EditableText
        value={title}
        onSave={setTitle}
        big
        tip="Нажмите, чтобы переименовать"
      />
      <EditableText
        value={note}
        onSave={setNote}
        multiline
        markdown
        placeholder="Добавить описание…"
        tip="Нажмите, чтобы отредактировать"
      />
    </div>
  );
}

export function MentionDemo() {
  return (
    <form className="w-full max-w-md">
      <MentionTextarea
        name="comment"
        people={PEOPLE}
        rows={3}
        placeholder="Наберите @ и начните вводить имя…"
      />
    </form>
  );
}

export function AvatarDemo() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-3">
        <Avatar person={PEOPLE[0]!} size="xs" />
        <Avatar person={PEOPLE[1]!} size="sm" />
        <Avatar person={PEOPLE[2]!} size="md" />
      </div>
      <AvatarStack people={PEOPLE} max={3} size="md" />
    </div>
  );
}

export function BadgeDemo() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge color="#6366f1">Фича</Badge>
        <Badge color="#ef4444">Баг</Badge>
        <Badge color="#f59e0b">Рефакторинг</Badge>
        <Badge color="#14b8a6" size="md">
          Исследование
        </Badge>
        <Badge>Без цвета</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge color="#eab308" solid>
          Жёлтый плотный
        </Badge>
        <Badge color="#1e293b" solid>
          Тёмный плотный
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        {[
          { level: 1, color: "#94a3b8", label: "Приоритет: низкий" },
          { level: 2, color: "#60a5fa", label: "Приоритет: средний" },
          { level: 3, color: "#f97316", label: "Приоритет: высокий" },
          { level: 4, color: "#ef4444", label: "Приоритет: критический" },
        ].map((p) => (
          <LevelMeter key={p.level} {...p} />
        ))}
      </div>
    </div>
  );
}

export function FieldDemo() {
  const [email, setEmail] = useState("не-почта");
  const invalid = !email.includes("@");

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Название проекта" required hint="Видно всем участникам">
        {(props) => <Input {...props} defaultValue="Личный кабинет" />}
      </Field>

      <Field label="Почта" error={invalid ? "Похоже, это не адрес почты" : undefined}>
        {(props) => (
          <Input {...props} value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
      </Field>

      <Field label="Роль">
        {(props) => (
          <Select {...props} defaultValue="MANAGER">
            <option value="ADMIN">Администратор</option>
            <option value="MANAGER">Менеджер</option>
            <option value="DEVELOPER">Разработчик</option>
          </Select>
        )}
      </Field>

      <Field label="Описание" hint="Поддерживается ограниченный Markdown">
        {(props) => <Textarea {...props} rows={3} placeholder="Что за проект…" />}
      </Field>
    </div>
  );
}

export function ThemeToggleDemo() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-edge bg-surface px-4 py-3">
      <span className="text-sm text-muted">Тема сайта:</span>
      <ThemeToggle labels={{ toDark: "Тёмная", toLight: "Светлая", action: "Переключить тему" }} />
    </div>
  );
}

export function LiveIndicatorDemo() {
  return (
    <div className="flex flex-col gap-3">
      <LiveIndicator
        status="live"
        updatedAt={new Date()}
        locale="ru-RU"
        labels={{ updated: "обновлено в {time}", tipLive: "Изменения приходят сами" }}
      />
      <LiveIndicator status="connecting" labels={{ connecting: "подключаемся…" }} />
      <LiveIndicator
        status="offline"
        labels={{ offline: "нет связи — обновления приостановлены" }}
      />
    </div>
  );
}

export function PageHintDemo() {
  return (
    <PageHint>Перетащите карточку к краю доски — она подкрутится сама.</PageHint>
  );
}
