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
        return router.createUrlTree(['/setup']);
      }
      if (authService.isAuthenticated()) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
    catchError(() => {
      if (authService.isAuthenticated()) {
        return of(true);
      }
      return of(router.createUrlTree(['/setup']));
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
        return router.createUrlTree(['/setup']);
      }
      if (!authService.isAuthenticated()) {
        return true;
      }
      return router.createUrlTree(['/']);
    }),
    catchError(() => {
      if (!authService.isAuthenticated()) {
        return of(router.createUrlTree(['/setup']));
      }
      return of(router.createUrlTree(['/']));
    })
  );
};
