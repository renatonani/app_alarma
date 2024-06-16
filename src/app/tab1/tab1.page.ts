import { Component } from '@angular/core';
import { DeviceMotion, DeviceMotionAccelerationData } from '@awesome-cordova-plugins/device-motion';
import { Howl } from 'howler';
import { Haptics } from '@capacitor/haptics';
import { Flashlight } from '@awesome-cordova-plugins/flashlight';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  isDetectorActivado: boolean = false;
  soundLeft: Howl;
  soundRight: Howl;
  soundVertical: Howl;
  soundHorizontal: Howl;
  soundError: Howl;
  soundDesactivar: Howl;
  contraseñaAlarma = "";
  sonidoActual: Howl | null = null;
  
  constructor(private afAuth: AuthService,
              private router: Router)
  {
    // Configura los sonidos
    this.soundLeft = new Howl({
      src: ['../../assets/alarma1.mp3'], // Ruta al sonido izquierdo
    });
    this.soundRight = new Howl({
      src: ['../../assets/alarma2.mp3'], // Ruta al sonido derecho
    });
    this.soundVertical = new Howl({
      src: ['../../assets/alarma3.mp3'], // Ruta al sonido vertical
    });
    this.soundHorizontal = new Howl({
      src: ['../../assets/alarma4.mp3'], // Ruta al sonido horizontal
    });
    this.soundError = new Howl({
      src: ['../../assets/alarma5.mp3'], // Ruta al sonido error
    });   
    this.soundDesactivar = new Howl({
      src: ['../../assets/desactivar.mp3'], // Ruta al sonido desactivar
    });   
    
    this.sonidoActual = this.soundHorizontal;
  }

   async activarDetector() {
    if (this.isDetectorActivado) {
      // Desactivar el detector de robo
      await this.desactivarAlarma();

    } else {
      // Activar el detector de robo
      this.isDetectorActivado = true;
      this.iniciarDetector();
      this.sonidoActual = this.soundHorizontal;
    }
  }

  async desactivarAlarma() {
    // Si el detector de robo está activado, solicitar la contraseña para desactivar
    const contraseñaIngresada = prompt("Ingrese la contraseña para desactivar la alarma:");
    if(contraseñaIngresada != null)
    {
      if (await this.afAuth.verificarContraseña(contraseñaIngresada)) {
        // Contraseña correcta, desactivar la alarma
        this.sonidoActual?.stop();  
        this.sonidoActual = this.soundDesactivar;
        this.sonidoActual.play();
        this.isDetectorActivado = false;   
        Haptics.vibrate({ duration: 1 });
        Flashlight.switchOff();     
      } else {
        // Contraseña incorrecta, realizar acciones (sonidos, vibración, luz) por 5 segundos
        this.realizarAccionesIncorrectas();        
      }
    }
  }

  async iniciarDetector() {
    // Escuchar eventos de cambio de posición
    DeviceMotion.watchAcceleration({ frequency: 200 }).subscribe(
      async (acceleration: DeviceMotionAccelerationData) => {
        if (this.isDetectorActivado) {
          // Verificar la posición y realizar acciones correspondientes
          if (acceleration.x > 5) {
            // Mover a la izquierda
            if (this.sonidoActual !== this.soundLeft) {
              if (this.sonidoActual) {
                this.sonidoActual.stop();
              }
              this.sonidoActual = this.soundLeft;
              this.sonidoActual.play(); // Reproducir sonido izquierdo
            }
          } else if (acceleration.x < -5) {
            // Mover a la derecha
            if (this.sonidoActual !== this.soundRight) {
              if (this.sonidoActual) {
                this.sonidoActual.stop();
              }
              this.sonidoActual = this.soundRight;
              this.sonidoActual.play(); // Reproducir sonido derecho
            }
          } else if (acceleration.y > 5) {
            // Dispositivo en posición vertical
            if (this.sonidoActual !== this.soundVertical) {
              if (this.sonidoActual) {
                this.sonidoActual.stop();
              }
              this.sonidoActual = this.soundVertical;
              this.sonidoActual.play(); // Reproducir sonido vertical
              this.encenderLuz();
            }
          } else if (Math.abs(acceleration.y) < 2) {
            // Dispositivo en posición horizontal
            if (this.sonidoActual !== this.soundHorizontal) {
              if (this.sonidoActual) {
                this.sonidoActual.stop();
              }
              this.sonidoActual = this.soundHorizontal;
              this.sonidoActual.play(); // Reproducir sonido horizontal
              await this.vibrar(5000);
            }
          }
        }
      }
    );
  }

  async encenderLuz() {
    try {
      // Verificar si la linterna está disponible
      const available = await Flashlight.available();
      
      if (available) {
        // Encender la linterna
        await Flashlight.switchOn();

        // Apagar la linterna después de 5 segundos
        setTimeout(async () => {
          await Flashlight.switchOff();
        }, 5000);
      } else {
        console.error('La linterna no está disponible en este dispositivo.');
      }
    } catch (error) {
      console.error('Error al encender la linterna:', error);
    }
  }

  async vibrar(duracion: number) {
    // Vibrar el dispositivo durante la duración especificada
    await Haptics.vibrate({ duration: duracion });
    // Detener la vibración después de la duración especificada
    setTimeout(async () => {
      await Haptics.vibrate({ duration: 1 });
    }, duracion);
  }

  realizarAccionesIncorrectas() {
    // Puedes agregar acciones para manejar la contraseña incorrecta
    if (this.sonidoActual !== this.soundError) {
      if (this.sonidoActual) {
        this.sonidoActual.stop();
      }
      this.sonidoActual = this.soundError;
      this.sonidoActual.play(); // Reproducir sonido de error
      this.vibrar(5000);
      this.encenderLuz(); // Encender la linterna si es necesario
    }
  }

  logout()
  {
    this.afAuth.logOut();
    Haptics.vibrate({ duration: 1 });
    Flashlight.switchOff();
    this.sonidoActual?.stop();  
    this.isDetectorActivado = false;  
    this.router.navigateByUrl("/login");
  }
}


