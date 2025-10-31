export interface UserForm {
  email: string;
  password: string;
  name: string;
  campus: string;
  tipo: string;
  avatar?: string;
  bolsa?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface UserRegistrationForm extends UserForm {
  confirmPassword?: string;
}
