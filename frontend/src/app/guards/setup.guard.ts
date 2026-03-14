import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SetupService } from '../services/setup.service';
import { map, catchError, of } from 'rxjs';

/**
 * Erlaubt Zugriff auf /setup nur wenn das System noch nicht initialisiert ist.
 * Leitet auf /login weiter wenn bereits initialisiert.
 */
export const setupGuard: CanActivateFn = () => {
  const setupService = inject(SetupService);
  const router = inject(Router);

  return setupService.getStatus().pipe(
    map(status => {
      if (status.istInitialisiert) {
        return router.createUrlTree(['/login']);
      }
      return true;
    }),
    catchError(() => {
      // Bei API-Fehler Setup-Seite trotzdem anzeigen — POST-Endpoints sind serverseitig geschuetzt.
      return of(true);
    })
  );
};
