export type Role = "admin" | "head_coach" | "athlete";

export type Gender = "male" | "female";

export interface ProfileRow {
  id: string;
  role: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string;
  program_name: string;
  gender: string | null;
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
    public readonly bio: string,
    public readonly programName: string,
    public readonly gender: Gender | null,
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
      row.bio,
      row.program_name,
      row.gender as Gender | null,
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

  /**
   * Aplica a Head Coach y Atleta: nombre y biografía son obligatorios para
   * que el resto de su comunidad pueda conocerlos. El Administrador no
   * tiene perfil público, así que siempre cuenta como completo.
   */
  get isProfileComplete(): boolean {
    if (this.isAdmin) return true;
    return this.fullName.trim().length > 0 && this.bio.trim().length > 0 && this.gender != null;
  }

  static readonly ROLE_LABEL: Record<Role, string> = {
    admin: "Administrador",
    head_coach: "Head Coach",
    athlete: "Atleta",
  };

  get roleLabel(): string {
    return Profile.ROLE_LABEL[this.role];
  }

  static readonly GENDER_LABEL: Record<Gender, string> = {
    male: "Hombre",
    female: "Mujer",
  };

  get genderLabel(): string | null {
    return this.gender ? Profile.GENDER_LABEL[this.gender] : null;
  }
}
