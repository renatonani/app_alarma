import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) {     
  }

  public async logIn(email : string, password : string)
  {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }
  
  public async logOut()
  {
    return await this.afAuth.signOut();
  }

  public async getUserUid()
  {
    return new Promise<string | null>((resolve, reject) => 
    {
      this.afAuth.authState.subscribe(user => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(null); 
        }
      });
    });
  }  

  public async getUserEmail() {
    const user = await this.afAuth.currentUser;
    if (user) {
      return user.email; // Obtener el correo electrónico del usuario
    } else {
      return null; // El usuario no ha iniciado sesión.
    }
  }

  public async verificarContraseña(contraseña: string) {
    const email = await this.getUserEmail() ?? ''; // Valor predeterminado de cadena vacía si email es null
    
    try {
      // Verificar la contraseña utilizando Firebase Authentication
      await this.afAuth.signInWithEmailAndPassword(email, contraseña);
      return true; // Contraseña correcta
    } catch (error) {
      return false; // Contraseña incorrecta
    }
  } 

}
