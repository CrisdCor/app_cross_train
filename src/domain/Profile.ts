export type Role = "admin" | "head_coach" | "athlete";

export interface ProfileRow {
  id: string;
  role: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Entidad de dominio. Encapsula los datos de un perfil y las reglas de
 * negocio asociadas a su rol — el resto de la app pregunta al objeto
 * ("profile.isAdmin"), nunca compara strings de rol sueltas.
 */
export class Profile {
  constructor(
    public readonly id: string,
    public readonly role: Role,
    public readonly username: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly avatarUrl: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  static fromRow(row: ProfileRow): Profile {
    return new Profile(
      row.id,
      row.role as Role,
      row.username,
      row.full_name,
      row.email,
      row.avatar_url,
      row.created_at,
      row.updated_at
    );
  }

  get isAdmin(): boolean {
    return this.role === "admin";
  }

  get isHeadCoach(): boolean {
    return this.role === "head_coach";
  }

  get isAthlete(): boolean {
    return this.role === "athlete";
  }

  get handle(): string {
    return `@${this.username}`;
  }

  get displayName(): string {
    return this.fullName.trim() || this.handle;
  }

  /** Primer nombre para saludos ("Hola, Cris"); cae al username si aún no hay nombre completo. */
  get greetingName(): string {
    const first = this.fullName.trim().split(/\s+/)[0];
    return first || this.username;
  }

  get initials(): string {
    const source = this.fullName.trim() || this.username;
    return source.slice(0, 2).toUpperCase();
  }

  static readonly ROLE_LABEL: Record<Role, string> = {
    admin: "Administrador",
    head_coach: "Head Coach",
    athlete: "Atleta",
  };

  get roleLabel(): string {
    return Profile.ROLE_LABEL[this.role];
  }
}
