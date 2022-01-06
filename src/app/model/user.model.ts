export class User {
  id: string | undefined
  email: string | null
  role: string | undefined // CLIENT or ADMIN

  constructor(id: string | undefined, email: string | null, role: string | undefined) {
    this.id = id;
    this.email = email;
    this.role = role;
  }
}
