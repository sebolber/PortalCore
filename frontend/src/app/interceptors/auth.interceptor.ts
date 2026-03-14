import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  const isPublicEndpoint = req.url.includes('/auth/login')
    || req.url.includes('/auth/verify')
    || req.url.includes('/setup/status');

  if (token && !isPublicEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/') && !req.url.includes('/setup/status')) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
