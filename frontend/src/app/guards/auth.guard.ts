import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SetupService } from '../services/setup.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const setupService = inject(SetupService);
  const router = inject(Router);

  return setupService.getStatus().pipe(
    map(status => {
      if (!status.istInitialisiert) {
        router.navigate(['/setup']);
        return false;
      }
      if (authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      if (authService.isAuthenticated()) {
        return of(true);
      }
      router.navigate(['/login']);
      return of(false);
    })
  );
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const setupService = inject(SetupService);
  const router = inject(Router);

  return setupService.getStatus().pipe(
    map(status => {
      if (!status.istInitialisiert) {
        router.navigate(['/setup']);
        return false;
      }
      if (!authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/']);
      return false;
    }),
    catchError(() => {
      if (!authService.isAuthenticated()) {
        return of(true);
      }
      router.navigate(['/']);
      return of(false);
    })
  );
};
