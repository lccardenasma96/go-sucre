import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'dialog-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    HttpClientModule
  ],
  templateUrl: './dialog-auth.component.html',
  styleUrls: ['./dialog-auth.component.css']
})
export class DialogAuthComponent {
  // Login
  email = '';
  password = '';
  loginError = '';

  // Register
  name = '';
  emailReg = '';
  passwordReg = '';
  registerSuccess = '';
  registerError = '';

  // Expiration message
  showExpirationMessage = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private dialogRef: MatDialogRef<DialogAuthComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Verificar si se debe mostrar el mensaje de expiración
    this.showExpirationMessage = data?.showExpirationMessage || false;
  }

  login() {
    this.api.login(this.email, this.password).subscribe({
      next: (res) => {
        this.auth.setToken(res.token);  // Guardar token y emitir cambio
        console.log("ya ingresaste =)");
        this.dialogRef.close();         // Cerrar modal
      },
      error: (err) => {
        this.loginError = err.error?.error || 'Error al iniciar sesión';
      }
    });
  }

  register() {
    if (!this.name || !this.emailReg || !this.passwordReg) {
      this.registerError = 'Todos los campos son obligatorios';
      this.registerSuccess = '';
      return;
    }

    this.api.register(this.name, this.emailReg, this.passwordReg).subscribe({
      next: (res) => {
        this.auth.setToken(res.token); // Guardar token y emitir cambio
        this.name = '';
        this.emailReg = '';
        this.passwordReg = '';
        this.registerSuccess = 'Usuario registrado';
        this.registerError = '';
        this.dialogRef.close();        // Cerrar modal tras éxito
      },
      error: (err) => {
        this.registerError = err.error?.error || 'Error al registrarse';
      }
    });
  }
}
