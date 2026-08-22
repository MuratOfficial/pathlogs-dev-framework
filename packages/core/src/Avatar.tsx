import { cn } from "./cn.js";

/** Инициалы имени: до двух первых букв слов. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export type AvatarSize = "xs" | "sm" | "md";

export interface AvatarPerson {
  id: string;
  name: string;
  /** Ссылка на фото. Без неё рисуются инициалы. */
  image?: string | null;
}

export interface AvatarProps {
  person: AvatarPerson;
  size?: AvatarSize;
  /** Показывать имя подсказкой при наведении. */
  tip?: boolean;
  className?: string;
}

const SIZES: Record<AvatarSize, string> = {
  xs: "pl-avatar--xs",
  sm: "pl-avatar--sm",
  md: "pl-avatar--md",
};

/** Аватар: фото, а без него — инициалы на акцентном фоне. */
export function Avatar({ person, size = "sm", tip = true, className }: AvatarProps) {
  return (
    <span
      className={cn("pl-avatar", SIZES[size], className)}
      data-tip={tip ? person.name : undefined}
      title={tip ? undefined : person.name}
    >
      {person.image ? (
        <img src={person.image} alt="" className="pl-avatar__img" />
      ) : (
        initials(person.name)
      )}
    </span>
  );
}

export interface AvatarStackProps {
  people: AvatarPerson[];
  /** Сколько показать до «+N». */
  max?: number;
  size?: AvatarSize;
  className?: string;
}

/**
 * Стопка аватаров с нахлёстом и счётчиком остатка.
 *
 * Остаток показывается именами в подсказке, а не просто числом: «+3»
 * без имён не отвечает на единственный вопрос, ради которого на него смотрят.
 */
export function AvatarStack({ people, max = 3, size = "sm", className }: AvatarStackProps) {
  if (people.length === 0) return null;

  const shown = people.slice(0, max);
  const rest = people.slice(max);

  return (
    <span className={cn("pl-avatar-stack", className)}>
      {shown.map((p) => (
        <Avatar key={p.id} person={p} size={size} />
      ))}
      {rest.length > 0 && (
        <span
          className={cn("pl-avatar", "pl-avatar--rest", SIZES[size])}
          data-tip={rest.map((p) => p.name).join(", ")}
        >
          +{rest.length}
        </span>
      )}
    </span>
  );
}
